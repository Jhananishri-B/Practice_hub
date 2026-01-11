import app from './app';
import logger from './config/logger';
import { initializeUsers } from './controllers/authController';
import pool from './config/database';

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

// Initialize default users on startup (non-blocking)
const initializeApp = async () => {
  const connected = await testConnection();
  if (connected) {
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

