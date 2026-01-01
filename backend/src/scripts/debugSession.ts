import { startSession } from '../services/sessionService';
import pool from '../config/database';
import { getRows } from '../utils/mysqlHelper';

const runDebug = async () => {
    try {
        console.log('Debugging startSession...');

        // Use the ID for C Level 1 from schema.sql
        const usersResult = await pool.query('SELECT id FROM users WHERE username="USER"');
        const userRows = getRows(usersResult);
        const userId = userRows[0]?.id; // Get real user ID
        const courseId = '550e8400-e29b-41d4-a716-446655440002'; // C Programming
        const levelId = '660e8400-e29b-41d4-a716-446655440011'; // Level 1 Pointers

        console.log(`Starting session for User: ${userId}, Course: ${courseId}, Level: ${levelId}`);

        const session = await startSession(userId, courseId, levelId, 'coding');
        console.log('Session started successfully:', session.id);

        process.exit(0);
    } catch (error) {
        console.error('Start Session Failed:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

runDebug();
