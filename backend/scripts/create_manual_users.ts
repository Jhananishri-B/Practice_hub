
import pool from '../src/config/database';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function createManualUsers() {
    try {
        console.log('--- Manually Creating Users ---');

        const userPassword = await bcrypt.hash('123', 10);
        const adminPassword = await bcrypt.hash('123', 10);

        // 1. Create/Update USER
        console.log('Processing USER...');
        const [userExists]: any = await pool.query('SELECT id FROM users WHERE username = ?', ['USER']);
        if (userExists.length > 0) {
            await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [userPassword, 'USER']);
            console.log('Updated password for USER');
        } else {
            await pool.query(
                'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
                [randomUUID(), 'USER', userPassword, 'student', 'Student User']
            );
            console.log('Created USER');
        }

        // 2. Create/Update ADMIN
        console.log('Processing ADMIN...');
        const [adminExists]: any = await pool.query('SELECT id FROM users WHERE username = ?', ['ADMIN']);
        if (adminExists.length > 0) {
            await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [adminPassword, 'ADMIN']);
            console.log('Updated password for ADMIN');
        } else {
            await pool.query(
                'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
                [randomUUID(), 'ADMIN', adminPassword, 'admin', 'Admin User']
            );
            console.log('Created ADMIN');
        }

        console.log('--- Done ---');
        process.exit(0);
    } catch (e) {
        console.error('Failed:', e);
        process.exit(1);
    }
}

createManualUsers();
