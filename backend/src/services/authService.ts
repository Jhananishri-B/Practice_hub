import pool from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import logger from '../config/logger';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserData {
  id: string;
  username: string;
  role: string;
  name: string | null;
  email: string | null;
}

export const login = async (credentials: LoginCredentials) => {
  const { username, password } = credentials;

  const result = await pool.query(
    'SELECT id, username, password_hash, role, name, email FROM users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

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
};

export const createDefaultUsers = async () => {
  try {
    // Check if users already exist
    const userCheck = await pool.query('SELECT id FROM users WHERE username IN ($1, $2)', ['USER', 'ADMIN']);
    
    if (userCheck.rows.length === 0) {
      const { hashPassword } = await import('../utils/password');
      
      const userPassword = await hashPassword('123');
      const adminPassword = await hashPassword('123');

      await pool.query(
        'INSERT INTO users (username, password_hash, role, name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        ['USER', userPassword, 'student', 'Student User']
      );

      await pool.query(
        'INSERT INTO users (username, password_hash, role, name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        ['ADMIN', adminPassword, 'admin', 'Admin User']
      );

      logger.info('Default users created');
    }
  } catch (error) {
    logger.error('Error creating default users:', error);
  }
};

