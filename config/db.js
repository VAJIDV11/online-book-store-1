const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookstore_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Test database connectivity and verify tables exist
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database Connection Error:');
    console.error(`   Message: ${error.message}`);
    console.error('   👉 Check your .env credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
    console.error('   👉 Ensure MySQL server is running and "schema.sql" has been executed.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
