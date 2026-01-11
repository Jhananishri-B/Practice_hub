import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Parse DATABASE_URL or use individual connection parameters
let connectionConfig: mysql.PoolOptions;

if (process.env.DATABASE_URL) {
  // Parse MySQL connection string: mysql://user:password@host:port/database?ssl=...
  // Handle malformed SSL parameters in URL
  let cleanUrl = process.env.DATABASE_URL;
  // Remove malformed SSL JSON from URL if present
  cleanUrl = cleanUrl.replace(/\?ssl=\{.*?\}/, '');
  
  const url = new URL(cleanUrl);

  // Check if SSL is required (for TiDB Cloud and other cloud databases)
  // TiDB Cloud always requires SSL
  const isTiDBCloud = url.hostname.includes('tidbcloud.com') || url.hostname.includes('tidb-cloud');
  const sslParam = url.searchParams.get('ssl');
  const requireSSL = isTiDBCloud || sslParam !== null;

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
    connectTimeout: 60000, // 60 seconds connection timeout
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
      // Fallback to basic SSL if CA file not found (required for TiDB Cloud)
      connectionConfig.ssl = {
        rejectUnauthorized: false,
      };
      console.warn('CA certificate not found, using SSL without certificate validation');
      if (isTiDBCloud) {
        console.warn('TiDB Cloud connection: SSL enabled without CA validation');
      }
    }
  }
} else {
  // Default to localhost MySQL for local development, or Docker service name when in container
  // Use 'localhost' when running outside Docker, 'mysql' when inside Docker
  const isDocker = process.env.DOCKER_ENV === 'true' || fs.existsSync('/.dockerenv');
  const defaultHost = isDocker ? 'mysql' : 'localhost';
  
  connectionConfig = {
    host: process.env.DB_HOST || defaultHost,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'practicehub',
    password: process.env.DB_PASSWORD || 'practicehub123',
    database: process.env.DB_NAME || 'practice_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 60000, // 60 seconds connection timeout
  };
}

const pool = mysql.createPool(connectionConfig);

pool.on('connection', () => {
  console.log('New MySQL connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection lost. Attempting to reconnect...');
  }
});

export default pool;
