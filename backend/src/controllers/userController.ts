import { Request, Response } from 'express';
import { getAllUsers, getUserById } from '../services/userService';
import logger from '../config/logger';

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * Get a single user by ID
 * GET /api/users/:id
 */
export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const user = await getUserById(id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error('Get user by ID error:', error);
    
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user',
      });
    }
  }
};




