const mysql = require("mysql2");

// Mock Database for Fallback
const mockDB = {
    query: (sql, params, callback) => {
        console.log("⚠️  [MOCK DB] Executing SQL:", sql);

        // Normalize callback (params is optional)
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        // --- Mock Data ---
        if (sql.includes("SELECT * FROM admins")) {
            return callback(null, [{
                id: 1,
                username: 'admin',
                // $2a$10$w.... is standard bcrypt. 
                password: '$2a$10$ExampleHashForMetamax2025' // Placeholder
            }]);
        }

        if (sql.includes("SELECT * FROM projects")) {
            return callback(null, [
                { id: 1, title: 'MySQL Demo Project', category: 'infrastructure', description: 'Served from MySQL Mock', image: 'demo.jpg' }
            ]);
        }

        if (sql.includes("SELECT * FROM sectors")) {
            return callback(null, [
                { id: 1, title: 'Mock Sector', category: 'aviation', description: 'Served from MySQL Mock', image: 'demo.jpg', is_active: 1 }
            ]);
        }

        // Default success for Inserts/Updates
        callback(null, { insertId: Date.now(), affectedRows: 1 });
    },
    // Mock connection release
    getConnection: (cb) => cb(null, { release: () => { } })
};

// Real MySQL Setup
let activeDB = mockDB; // Default to mock

try {
    console.log("🔌 Attempting Real MySQL:", {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "tiFfur-9mokta-noxbys",
        database: process.env.DB_NAME || "Metamax",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000
    });

    // Test Connection
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("❌ MySQL Connection Failed:", err.message);
            console.log("⚠️  Switching to IN-MEMORY MOCK MODE for demonstration.");
            // ActiveDB stays as mockDB
        } else {
            console.log("✅ MySQL Connected Successfully");
            connection.release();
            activeDB = pool; // Swap to real pool
        }
    });

} catch (e) {
    console.error("❌ DB Init Error:", e.message);
    // ActiveDB stays as mockDB
}

// Proxy object to forward calls to whichever DB is active
const dbProxy = {
    query: function (...args) {
        return activeDB.query(...args);
    },
    getConnection: function (...args) {
        return activeDB.getConnection(...args);
    }
};

module.exports = dbProxy;
