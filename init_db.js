const mysql = require('mysql2/promise');
require('dotenv').config();

const schemaSql = [
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`,
    `USE ${process.env.DB_NAME};`,

    `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS sectors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(150),
        topic VARCHAR(100),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
];

async function initDB() {
    console.log(`🔌 Connecting to MySQL at ${process.env.DB_HOST}...`);

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        console.log('✅ Connected! Initializing Schema...');

        for (const sql of schemaSql) {
            await connection.query(sql);
            console.log(`   ✔️ Executed: ${sql.substring(0, 50)}...`);
        }

        // Check if admin exists, if not create default
        const [rows] = await connection.query(`SELECT * FROM admins WHERE username = 'admin'`);
        if (rows.length === 0) {
            console.log('👤 Creating default admin user...');
            // 'metamax2025' hash - using a pre-calculated one for simplicity since we don't have bcrypt here easily without require
            // $2a$10$w....
            // Wait, we can require bcryptjs if installed.
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('metamax2025', salt);

            await connection.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hash]);
            console.log('   ✔️ Admin created: admin / metamax2025');
        } else {
            console.log('   ℹ️ Admin user already exists.');
        }

        console.log('🚀 Database Metamax is ready!');

    } catch (err) {
        console.error('❌ DB Initialization Failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

initDB();
