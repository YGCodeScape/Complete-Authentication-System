const mysql = require('mysql2/promise');

let pool;

const connectDB = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
        });

        // Test connection
        const connection = await pool.getConnection();
        console.log(" MySQL Connected");
        connection.release();

    } catch (error) {
        console.error(" DB Connection Failed:", error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!pool) {
        throw new Error("Database not initialized!");
    }
    return pool;
};

module.exports = { connectDB, getDB };