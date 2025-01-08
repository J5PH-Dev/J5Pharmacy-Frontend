const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: process.env.TIMEZONE_OFFSET || '+08:00',
  dateStrings: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 60000,
  maxRetries: 3,
  retryDelay: 1000
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
    // Implement retry logic
    let retries = 0;
    const maxRetries = 3;
    while (retries < maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        const [rows] = await promisePool.query('SELECT 1');
        console.log('Database connection successful after retry');
        return;
      } catch (retryError) {
        retries++;
        console.error(`Retry ${retries} failed:`, retryError);
      }
    }
  }
};

// Add connection error handler
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log('Attempting to reconnect to database...');
    testConnection();
  }
});

module.exports = {
  pool: promisePool,
  testConnection
}; 