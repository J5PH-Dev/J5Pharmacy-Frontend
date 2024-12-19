const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.TIMEZONE_OFFSET || '+08:00',
  dateStrings: true
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection and set timezone
const testConnection = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    // Set session timezone
    await promisePool.query(`SET time_zone='${process.env.TIMEZONE_OFFSET || "+08:00"}'`);
    console.log('Database connection successful');
    console.log('Timezone set to:', process.env.TIMEZONE_OFFSET || '+08:00');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

module.exports = {
  pool: promisePool,
  testConnection
}; 