import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Input Validation Middleware
// ============================================================================

/**
 * Validate UUID format
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize code input - allow code but prevent injection
 */
export const sanitizeCode = (code: string): string => {
  if (typeof code !== 'string') return '';
  // For code, we mainly want to limit size
  const MAX_CODE_LENGTH = 50000; // 50KB
  return code.substring(0, MAX_CODE_LENGTH);
};

/**
 * Middleware to validate route params are valid UUIDs
 */
export const validateUUIDParams = (...paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (value && !isValidUUID(value)) {
        return res.status(400).json({
          error: `Invalid ${param} format`,
          details: `${param} must be a valid UUID`,
        });
      }
    }
    next();
  };
};

/**
 * Middleware to sanitize common request body fields
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizedBody: Record<string, any> = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        // Preserve code fields
        if (key === 'code' || key === 'submitted_code' || key === 'submittedCode') {
          sanitizedBody[key] = sanitizeCode(value);
        } else {
          sanitizedBody[key] = sanitizeString(value);
        }
      } else {
        sanitizedBody[key] = value;
      }
    }

    req.body = sanitizedBody;
  }
  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Enforce limits
  req.query.page = String(Math.max(1, page));
  req.query.limit = String(Math.min(100, Math.max(1, limit))); // Max 100 items

  next();
};

/**
 * Check for required fields
 */
export const requireFields = (...fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missing,
      });
    }
    next();
  };
};
