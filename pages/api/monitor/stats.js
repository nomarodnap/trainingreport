import os from 'os';
import { parse } from 'cookie';
import pool from '../../../lib/db';

export default async function handler(req, res) {
  // Only GET allowed
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Prevent caching for live monitor stats
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Authenticate superadmin
  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session;

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized: No session cookie' });
  }

  let username;
  try {
    const parsedSession = JSON.parse(session);
    username = parsedSession.username;
  } catch (e) {
    return res.status(400).json({ message: 'Invalid session format' });
  }

  const connection = await pool.getConnection();

  try {
    // 1. Verify superadmin role from DB
    const [userRows] = await connection.execute(
      'SELECT username, status, first_name, last_name FROM users WHERE username = ?',
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userRows[0].status !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden: Superadmin access only' });
    }

    // 2. Measure DB ping latency
    const pingStart = Date.now();
    await connection.query('SELECT 1');
    const dbPingMs = Date.now() - pingStart;

    // 3. System (OS / Node Process) Info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = process.memoryUsage();
    const cpus = os.cpus() || [];

    const systemInfo = {
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown CPU',
      processUptimeSeconds: Math.floor(process.uptime()),
      systemUptimeSeconds: Math.floor(os.uptime()),
      totalMemoryBytes: totalMem,
      freeMemoryBytes: freeMem,
      usedMemoryBytes: usedMem,
      memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
      processMemory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      },
      serverTime: new Date().toISOString(),
      loadAvg: os.loadavg ? os.loadavg() : [0, 0, 0],
    };

    // 4. Users Statistics
    let userStats = {
      totalUsers: 0,
      activeToday: 0,
      activePastHour: 0,
      roleBreakdown: [],
      recentLogins: [],
    };

    try {
      const [totalUsersRow] = await connection.query('SELECT COUNT(*) AS total FROM users');
      userStats.totalUsers = totalUsersRow[0]?.total || 0;

      const [roleRows] = await connection.query(
        'SELECT COALESCE(status, "unknown") AS role, COUNT(*) AS count FROM users GROUP BY status'
      );
      userStats.roleBreakdown = roleRows;

      // Active users check (based on last_login if column exists)
      try {
        const [activeTodayRow] = await connection.query(
          'SELECT COUNT(*) AS count FROM users WHERE last_login IS NOT NULL AND DATE(last_login) = CURDATE()'
        );
        userStats.activeToday = activeTodayRow[0]?.count || 0;

        const [activeHourRow] = await connection.query(
          'SELECT COUNT(*) AS count FROM users WHERE last_login IS NOT NULL AND last_login >= NOW() - INTERVAL 1 HOUR'
        );
        userStats.activePastHour = activeHourRow[0]?.count || 0;

        const [recentLoginRows] = await connection.query(
          `SELECT id, username, first_name, last_name, status, department, group_name, position, level, last_login 
           FROM users 
           WHERE last_login IS NOT NULL 
           ORDER BY last_login DESC 
           LIMIT 15`
        );
        userStats.recentLogins = recentLoginRows;
      } catch (err) {
        console.warn('last_login query warning:', err.message);
      }
    } catch (err) {
      console.error('Error querying users stats:', err);
    }

    // 5. Training Reports Statistics
    let reportStats = {
      totalReports: 0,
      reportsToday: 0,
      statusBreakdown: [],
      dailyTrend: [],
    };

    try {
      const [totalReportsRow] = await connection.query('SELECT COUNT(*) AS total FROM training_reports');
      reportStats.totalReports = totalReportsRow[0]?.total || 0;

      try {
        const [reportsTodayRow] = await connection.query(
          'SELECT COUNT(*) AS count FROM training_reports WHERE DATE(submitTime) = CURDATE()'
        );
        reportStats.reportsToday = reportsTodayRow[0]?.count || 0;

        const [statusRows] = await connection.query(
          'SELECT COALESCE(status, "pending") AS status, COUNT(*) AS count FROM training_reports GROUP BY status'
        );
        reportStats.statusBreakdown = statusRows;

        const [trendRows] = await connection.query(
          `SELECT DATE_FORMAT(submitTime, '%Y-%m-%d') as date, COUNT(*) as count 
           FROM training_reports 
           WHERE submitTime >= CURDATE() - INTERVAL 14 DAY 
           GROUP BY DATE_FORMAT(submitTime, '%Y-%m-%d') 
           ORDER BY date ASC`
        );
        reportStats.dailyTrend = trendRows;
      } catch (err) {
        console.warn('training_reports detail query warning:', err.message);
      }
    } catch (err) {
      console.error('Error querying report stats:', err);
    }

    // 6. Support Requests & Notifications Statistics
    let supportStats = {
      totalRequests: 0,
      pendingRequests: 0,
    };
    try {
      const [totalSupportRow] = await connection.query('SELECT COUNT(*) AS total FROM support_requests');
      supportStats.totalRequests = totalSupportRow[0]?.total || 0;

      try {
        const [pendingSupportRow] = await connection.query(
          'SELECT COUNT(*) AS pending FROM support_requests WHERE status = "pending" OR status IS NULL'
        );
        supportStats.pendingRequests = pendingSupportRow[0]?.pending || 0;
      } catch (e) {}
    } catch (e) {
      // table might not exist
    }

    let notificationStats = {
      totalNotifications: 0,
      unreadNotifications: 0,
    };
    try {
      const [totalNotifRow] = await connection.query('SELECT COUNT(*) AS total FROM notifications');
      notificationStats.totalNotifications = totalNotifRow[0]?.total || 0;

      const [unreadNotifRow] = await connection.query('SELECT COUNT(*) AS unread FROM notifications WHERE isRead = 0 OR isRead IS NULL');
      notificationStats.unreadNotifications = unreadNotifRow[0]?.unread || 0;
    } catch (e) {}

    // 7. Database Tables Overview
    let tableStats = [];
    try {
      const [tableRows] = await connection.query(
        `SELECT TABLE_NAME as tableName, TABLE_ROWS as tableRows, DATA_LENGTH as dataLength, INDEX_LENGTH as indexLength, UPDATE_TIME as updateTime
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ?
         ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC`,
        [process.env.DB_NAME]
      );
      tableStats = tableRows.map(t => ({
        name: t.tableName,
        rows: t.tableRows,
        dataSizeKB: Math.round((t.dataLength || 0) / 1024),
        indexSizeKB: Math.round((t.indexLength || 0) / 1024),
        totalSizeKB: Math.round(((t.dataLength || 0) + (t.indexLength || 0)) / 1024),
        updateTime: t.updateTime,
      }));
    } catch (err) {
      console.warn('information_schema query warning:', err.message);
    }

    return res.status(200).json({
      status: 'success',
      timestamp: Date.now(),
      db: {
        status: 'online',
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        pingMs: dbPingMs,
        tables: tableStats,
      },
      system: systemInfo,
      users: userStats,
      reports: reportStats,
      support: supportStats,
      notifications: notificationStats,
    });

  } catch (error) {
    console.error('❌ /api/monitor/stats error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error while fetching monitor stats',
      error: error.message 
    });
  } finally {
    connection.release();
  }
}
