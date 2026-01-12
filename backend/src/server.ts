import app from './app';
import logger from './config/logger';
import { initializeUsers } from './controllers/authController';
import pool from './config/database';
import { hashPassword } from './utils/password';
import { getRows } from './utils/mysqlHelper';

const PORT = process.env.PORT || 5000;

// Test database connection first
const testConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
  if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);
      logger.error(`Error code: ${(error as any).code}`);
    }
    return false;
  }
};

// Ensure dev bypass users exist (for development/testing)
const ensureDevBypassUsers = async () => {
  try {
    logger.info('[Server] Ensuring dev bypass users exist...');
    
    // Check if user-1 exists
    const user1Check = await pool.query('SELECT id FROM users WHERE id = ?', ['user-1']);
    const user1Rows = getRows(user1Check);
    
    if (user1Rows.length === 0) {
      logger.info('[Server] Creating dev bypass user: user-1');
      const passwordHash = await hashPassword('dev-bypass-password');
      try {
        await pool.query(
          'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
          ['user-1', 'user', passwordHash, 'student', 'Student User (Dev Bypass)']
        );
        logger.info('[Server] Dev bypass user user-1 created successfully');
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('username')) {
          // Username exists, update it
          await pool.query('UPDATE users SET id = ? WHERE username = ?', ['user-1', 'user']);
          logger.info('[Server] Updated existing user to use dev bypass ID: user-1');
        } else {
          throw error;
        }
      }
    } else {
      logger.info('[Server] Dev bypass user user-1 already exists');
    }
    
    // Check if admin-1 exists
    const admin1Check = await pool.query('SELECT id FROM users WHERE id = ?', ['admin-1']);
    const admin1Rows = getRows(admin1Check);
    
    if (admin1Rows.length === 0) {
      logger.info('[Server] Creating dev bypass user: admin-1');
      const passwordHash = await hashPassword('dev-bypass-password');
      try {
        await pool.query(
          'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
          ['admin-1', 'admin', passwordHash, 'admin', 'Admin User (Dev Bypass)']
        );
        logger.info('[Server] Dev bypass user admin-1 created successfully');
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('username')) {
          // Username exists, update it
          await pool.query('UPDATE users SET id = ? WHERE username = ?', ['admin-1', 'admin']);
          logger.info('[Server] Updated existing user to use dev bypass ID: admin-1');
        } else {
          throw error;
        }
      }
    } else {
      logger.info('[Server] Dev bypass user admin-1 already exists');
    }
  } catch (error: any) {
    logger.warn('[Server] Failed to ensure dev bypass users (non-critical):', error.message);
  }
};

// Initialize default users on startup (non-blocking)
const initializeApp = async () => {
  const connected = await testConnection();
  if (connected) {
    // Ensure dev bypass users first
    await ensureDevBypassUsers();
    
    // Then initialize regular users
    initializeUsers().catch((error) => {
      logger.warn('Failed to initialize default users (this is non-critical):', error.message);
    });
  } else {
    logger.warn('Skipping user initialization - database connection failed');
  }
};

// Start initialization in background
initializeApp();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`); // Server started
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

