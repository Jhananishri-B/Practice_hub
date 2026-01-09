import pool from '../src/config/database';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function run() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await pool.getConnection();
        console.log('Connected.');

        // Check if exists
        const [rows]: any = await connection.query('SELECT id FROM users WHERE username IN (?, ?)', ['USER', 'ADMIN']);
        if (rows.length === 2) {
            console.log('✅ Users already exist.');
            return;
        }

        console.log('Creating users...');
        const hash = await bcrypt.hash('123', 10);

        // Insert USER
        await connection.query(
            'INSERT IGNORE INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
            [randomUUID(), 'USER', hash, 'student', 'Student User']
        );

        // Insert ADMIN
        await connection.query(
            'INSERT IGNORE INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
            [randomUUID(), 'ADMIN', hash, 'admin', 'Admin User']
        );

        console.log('✅ Users created successfully.');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        if (connection) connection.release();
        await pool.end();
        process.exit(0);
    }
}

run();
