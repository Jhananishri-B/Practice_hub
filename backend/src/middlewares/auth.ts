import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authentication failed: No authorization header or invalid format');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('Authentication attempt - Token received:', token.substring(0, 30) + '...');

    // DEV BYPASS - Accept both admin and user bypass tokens
    if (token === 'mock-jwt-token-dev-bypass' || token === 'mock-jwt-token-dev-bypass-user') {
      // Determine role based on token
      const isAdmin = token === 'mock-jwt-token-dev-bypass';
      req.user = { 
        userId: isAdmin ? 'admin-1' : 'user-1', 
        username: isAdmin ? 'admin' : 'user', 
        role: isAdmin ? 'admin' : 'student' 
      };
      console.log('Dev bypass authentication successful:', req.user);
      next();
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('Token authentication successful:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

