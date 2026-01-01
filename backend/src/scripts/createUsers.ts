import pool from '../config/database';
import { hashPassword } from '../utils/password';
import { randomUUID } from 'crypto';

const createUsers = async () => {
    try {
        console.log('Creating default users manually...');

        const password = await hashPassword('123');
        const adminId = randomUUID();
        const userId = randomUUID();

        // Delete existing to ensure clean state
        await pool.query('DELETE FROM users WHERE username IN (?, ?)', ['ADMIN', 'USER']);

        await pool.query(
            'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'ADMIN', password, 'admin', 'Admin User']
        );

        await pool.query(
            'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
            [userId, 'USER', password, 'student', 'Student User']
        );

        console.log('Users created successfully!');
        console.log('ADMIN / 123');
        console.log('USER / 123');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create users:', error);
        process.exit(1);
    }
};

createUsers();
