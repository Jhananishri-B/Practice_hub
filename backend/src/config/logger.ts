import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'practice-hub-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

// Always add console transport for visibility
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// ============================================================================
// Enhanced Logging Utilities
// ============================================================================

/**
 * Log practice attempt
 */
export const logPracticeAttempt = (
  userId: string,
  skillId: string,
  attemptType: string,
  isCorrect: boolean,
  durationMs?: number
) => {
  logger.info('Practice attempt', {
    category: 'practice',
    userId,
    skillId,
    attemptType,
    isCorrect,
    durationMs,
  });
};

/**
 * Log slow query warning
 */
export const logSlowQuery = (query: string, durationMs: number, threshold: number = 1000) => {
  if (durationMs > threshold) {
    logger.warn('Slow query detected', {
      category: 'performance',
      query: query.substring(0, 200), // Truncate for safety
      durationMs,
      threshold,
    });
  }
};

/**
 * Log authentication event
 */
export const logAuthEvent = (
  event: 'login' | 'logout' | 'register' | 'token_refresh' | 'failed_login',
  userId?: string,
  email?: string,
  ip?: string
) => {
  logger.info('Auth event', {
    category: 'auth',
    event,
    userId,
    email,
    ip,
  });
};

/**
 * Log adaptive learning decision
 */
export const logAdaptiveDecision = (
  userId: string,
  skillId: string,
  decision: string,
  reason: string
) => {
  logger.info('Adaptive decision', {
    category: 'adaptive',
    userId,
    skillId,
    decision,
    reason,
  });
};

/**
 * Log API error
 */
export const logApiError = (
  endpoint: string,
  method: string,
  error: Error,
  userId?: string
) => {
  logger.error('API error', {
    category: 'api',
    endpoint,
    method,
    userId,
    error: error.message,
    stack: error.stack,
  });
};

export default logger;

