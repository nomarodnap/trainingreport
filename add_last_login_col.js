
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const dbConfig = fs.readFileSync(envPath, 'utf8');
            dbConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
        const envLocalPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envLocalPath)) {
            const dbConfig = fs.readFileSync(envLocalPath, 'utf8');
            dbConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }

    } catch (e) {
        console.error('Error loading env:', e);
    }
}

loadEnv();

async function alterTable() {
    console.log("Connecting to", process.env.DB_HOST, process.env.DB_USER);
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        await db.execute("ALTER TABLE users ADD COLUMN last_login DATETIME NULL");
        console.log("Column last_login added successfully.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column last_login already exists.");
        } else {
            console.error("Error adding column:", err);
        }
    }
    await db.end();
}

alterTable().catch(console.error);
