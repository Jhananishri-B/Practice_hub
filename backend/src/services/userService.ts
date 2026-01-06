import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  name: string | null;
  roll_number: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all users from the database
 */
export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    `SELECT id, username, email, role, name, roll_number, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return getRows(result);
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  const result = await pool.query(
    `SELECT id, username, email, role, name, roll_number, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [userId]
  );

  const user = getFirstRow(result);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
};




