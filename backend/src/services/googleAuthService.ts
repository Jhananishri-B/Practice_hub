import { OAuth2Client } from 'google-auth-library';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';
import logger from '../config/logger';
import { randomUUID } from 'crypto';
import { getRows, getFirstRow } from '../utils/mysqlHelper';

// Initialize OAuth2Client - redirect URI will be set during token exchange
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const verifyGoogleToken = async (token: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
    };
  } catch (error) {
    logger.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

export const exchangeCodeForToken = async (code: string): Promise<GoogleUserInfo> => {
  try {
    // For auth-code flow, redirect URI should be the frontend URL
    // This must match what's configured in Google Cloud Console
    const redirectUri = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    logger.info(`Exchanging code with redirect URI: ${redirectUri}`);
    
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken({
      code: code,
      redirect_uri: redirectUri,
    });
    
    if (!tokens.id_token) {
      throw new Error('No ID token received');
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
    };
  } catch (error: any) {
    logger.error('Google code exchange error:', error);
    logger.error('Error details:', error.message || error);
    throw new Error(`Failed to exchange code for token: ${error.message || 'Unknown error'}`);
  }
};

export const findOrCreateGoogleUser = async (googleUser: GoogleUserInfo) => {
  try {
    // Check if user exists by email
    let result = await pool.query(
      'SELECT id, username, role, name, email FROM users WHERE email = ?',
      [googleUser.email]
    );

    const rows = getRows(result);
    let user;

    if (rows.length > 0) {
      // User exists, return existing user
      user = rows[0];
      logger.info(`Existing user logged in via Google: ${user.email}`);
    } else {
      // Create new user
      const userId = randomUUID();
      const username = googleUser.email.split('@')[0] + '_' + Date.now().toString().slice(-6);
      // Generate a random password hash (user won't use it, but required by schema)
      const randomPassword = await hashPassword(randomUUID());

      await pool.query(
        `INSERT INTO users (id, username, password_hash, role, name, email) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, randomPassword, 'student', googleUser.name, googleUser.email]
      );

      user = {
        id: userId,
        username,
        role: 'student',
        name: googleUser.name,
        email: googleUser.email,
      };

      logger.info(`New user created via Google: ${user.email}`);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error: any) {
    logger.error('Error in findOrCreateGoogleUser:', error);
    throw new Error(error.message || 'Failed to authenticate with Google');
  }
};

