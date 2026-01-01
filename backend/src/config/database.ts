import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Parse DATABASE_URL or use individual connection parameters
let connectionConfig: mysql.PoolOptions;

if (process.env.DATABASE_URL) {
  // Parse MySQL connection string: mysql://user:password@host:port/database?ssl=...
  const url = new URL(process.env.DATABASE_URL);

  // Check if SSL is required (for TiDB Cloud and other cloud databases)
  const sslParam = url.searchParams.get('ssl');
  const requireSSL = sslParam !== null;

  connectionConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  };

  // Add SSL configuration if required
  if (requireSSL) {
    const caPath = path.join(__dirname, '..', '..', 'tidb-ca.pem');
    if (fs.existsSync(caPath)) {
      connectionConfig.ssl = {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true,
      };
      console.log('SSL/TLS enabled for database connection with CA certificate');
    } else {
      // Fallback to basic SSL if CA file not found
      connectionConfig.ssl = {
        rejectUnauthorized: false,
      };
      console.warn('CA certificate not found, using SSL without certificate validation');
    }
  }
} else {
  connectionConfig = {
    host: process.env.DB_HOST || 'mysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'practicehub',
    password: process.env.DB_PASSWORD || 'practicehub123',
    database: process.env.DB_NAME || 'practice_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  };
}

const pool = mysql.createPool(connectionConfig);

pool.on('connection', (connection) => {
  console.log('New MySQL connection established');
});

export default pool;
