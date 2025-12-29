import { Request, Response } from 'express';
import { login, createDefaultUsers } from '../services/authService';
import { verifyGoogleToken, exchangeCodeForToken, findOrCreateGoogleUser } from '../services/googleAuthService';
import logger from '../config/logger';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await login({ username, password });
    res.json(result);
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

export const googleLoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, code } = req.body;

    let googleUser;

    if (code) {
      // Exchange authorization code for user info
      googleUser = await exchangeCodeForToken(code);
    } else if (token) {
      // Verify ID token directly
      googleUser = await verifyGoogleToken(token);
    } else {
      res.status(400).json({ error: 'Google token or code is required' });
      return;
    }

    // Find or create user
    const result = await findOrCreateGoogleUser(googleUser);

    res.json(result);
  } catch (error: any) {
    logger.error('Google login error:', error);
    res.status(401).json({ error: error.message || 'Google authentication failed' });
  }
};

export const initializeUsers = async (): Promise<void> => {
  await createDefaultUsers();
};

