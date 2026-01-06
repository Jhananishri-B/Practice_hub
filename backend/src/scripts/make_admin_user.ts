
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const createAdmin = async () => {
    const email = 'admin@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if exists
        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log('User exists. Updating role to admin...');
            await pool.query('UPDATE users SET role = "admin" WHERE email = ?', [email]);
        } else {
            console.log('Creating new admin user...');
            const id = randomUUID();
            await pool.query('INSERT INTO users (id, name, email, password, role, username, roll_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, 'Admin User', email, hashedPassword, 'admin', 'admin', 'ADMIN001']);
        }
        console.log('Admin user ready: admin@example.com / password123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

createAdmin();
