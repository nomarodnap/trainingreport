
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

async function checkUsersTable() {
    console.log("Connecting to", process.env.DB_HOST, process.env.DB_USER);
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    const [rows] = await db.execute("DESCRIBE users");
    console.log(JSON.stringify(rows, null, 2));
    await db.end();
}

checkUsersTable().catch(console.error);
