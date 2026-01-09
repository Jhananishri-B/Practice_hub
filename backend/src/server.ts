import app from './app';
import logger from './config/logger';
import { initializeUsers } from './controllers/authController';

const PORT = process.env.PORT || 5000;

// Initialize default users on startup
initializeUsers().catch((error) => {
  console.error('Failed to initialize default users:', error);
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack);
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`); // Server started
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

