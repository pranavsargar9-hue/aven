const mysql = require('mysql2/promise');
require('dotenv').config();

// Local MySQL doesn't need SSL, but most free cloud MySQL providers (e.g. Aiven)
// require it. Set DB_SSL_CA in your .env (the CA certificate content) to enable
// a verified SSL connection; local development is unaffected if it's left unset.
const sslConfig = process.env.DB_SSL_CA
  ? { ca: process.env.DB_SSL_CA, rejectUnauthorized: true }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aven',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig
});

module.exports = pool;
