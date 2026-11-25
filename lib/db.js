import mysql from 'mysql2/promise';
import * as Sentry from '@sentry/nextjs';

function parseSqlMetadata(sqlInput) {
  const rawSql = typeof sqlInput === 'string' ? sqlInput : sqlInput?.sql;
  if (typeof rawSql !== 'string') {
    return {
      spanName: 'mysql2.query',
      operation: undefined,
      table: undefined,
      sanitizedSql: undefined,
    };
  }

  const collapsed = rawSql.replace(/\s+/g, ' ').trim();
  const sanitizedSql = collapsed.replace(/'(?:''|[^'])*'/g, '?').slice(0, 500);
  const opMatch = collapsed.match(
    /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|SHOW|CALL|REPLACE)\b/i
  );
  const operation = opMatch ? opMatch[1].toUpperCase() : undefined;

  let table;
  if (operation === 'SELECT' || operation === 'DELETE') {
    table = collapsed.match(/\bFROM\s+`?([a-zA-Z0-9_]+)`?/i)?.[1];
  } else if (operation === 'INSERT' || operation === 'REPLACE') {
    table = collapsed.match(/\bINTO\s+`?([a-zA-Z0-9_]+)`?/i)?.[1];
  } else if (operation === 'UPDATE') {
    table = collapsed.match(/^UPDATE\s+`?([a-zA-Z0-9_]+)`?/i)?.[1];
  } else if (operation === 'CREATE' || operation === 'ALTER' || operation === 'DROP') {
    table = collapsed.match(
      /\bTABLE\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/i
    )?.[1];
  }

  const spanName =
    operation && table
      ? `${operation} ${table}`
      : operation
        ? `${operation} mysql2`
        : 'mysql2.query';

  return { spanName, operation, table, sanitizedSql };
}

// สร้าง pool การเชื่อมต่อกับฐานข้อมูล MySQL
// ใช้ Singleton Pattern เพื่อป้องกัน Too many connections
if (!global.pool) {
  global.pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 120, // เพิ่มเป็น 20 เพื่อรองรับ request ได้มากขึ้น
    queueLimit: 0, // จำกัดจำนวนคำขอในคิว
    enableKeepAlive: true, // เปิด Keep-Alive เพื่อลด overhead การเชื่อมต่อใหม่
    keepAliveInitialDelay: 0,
  });
}

/** @type {import('mysql2/promise').Pool} */
const pool = global.pool;

// mysql2 < 3.20 PromisePool.query calls conn.query(cmdQuery) without a callback,
// bypassing Sentry's Orchestrion callback hook; wrap pool.query once so DB spans appear.
if (!pool.__sentryQueryWrapped) {
  const originalQuery = pool.query.bind(pool);
  pool.query = function tracedPoolQuery(sql, values) {
    const { spanName, operation, table, sanitizedSql } = parseSqlMetadata(sql);
    return Sentry.startSpan(
      {
        name: spanName,
        op: 'db.query',
        onlyIfParent: true,
        attributes: {
          'db.system.name': 'mysql',
          ...(operation ? { 'db.operation.name': operation } : {}),
          ...(table ? { 'db.collection.name': table } : {}),
          ...(sanitizedSql ? { 'db.query.text': sanitizedSql } : {}),
          ...(process.env.DB_NAME ? { 'db.namespace': process.env.DB_NAME } : {}),
        },
      },
      () => (values !== undefined ? originalQuery(sql, values) : originalQuery(sql))
    );
  };
  Object.defineProperty(pool, '__sentryQueryWrapped', { value: true });
}

// ตรวจสอบการเชื่อมต่อ
const checkConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// ทดสอบการเชื่อมต่อกับฐานข้อมูลเมื่อเริ่มต้น
// ทดสอบการเชื่อมต่อกับฐานข้อมูลเมื่อเริ่มต้น
// checkConnection(); // Comment out to prevent build hang (Node process not exiting)

export default pool;
