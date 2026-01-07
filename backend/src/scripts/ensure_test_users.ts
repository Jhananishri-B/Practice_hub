
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const ensureTestUsers = async () => {
    try {
        console.log('Ensuring test users exist...');

        // 1. Create/Update Admin User
        const adminEmail = 'admin_verify@example.com';
        const adminPass = 'AdminPass123!';
        const hashedAdminPass = await bcrypt.hash(adminPass, 10);

        const adminCheck = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
        // @ts-ignore
        if (adminCheck[0] && adminCheck[0].length > 0) {
            console.log('Updating existing admin user...');
            await pool.query('UPDATE users SET role = "admin", password_hash = ? WHERE email = ?', [hashedAdminPass, adminEmail]);
        } else {
            console.log('Creating new admin user...');
            await pool.query(
                'INSERT INTO users (id, username, email, password_hash, role, name, roll_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [randomUUID(), 'admin_verify', adminEmail, hashedAdminPass, 'admin', 'Admin Verify', 'ADMIN001']
            );
        }

        // 2. Create/Update Student User
        const studentEmail = 'student_verify@example.com';
        const studentPass = 'StudentPass123!';
        const hashedStudentPass = await bcrypt.hash(studentPass, 10);

        const studentCheck = await pool.query('SELECT id FROM users WHERE email = ?', [studentEmail]);
        // @ts-ignore
        if (studentCheck[0] && studentCheck[0].length > 0) {
            console.log('Updating existing student user...');
            await pool.query('UPDATE users SET role = "student", password_hash = ? WHERE email = ?', [hashedStudentPass, studentEmail]);
        } else {
            console.log('Creating new student user...');
            await pool.query(
                'INSERT INTO users (id, username, email, password_hash, role, name, roll_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [randomUUID(), 'student_verify', studentEmail, hashedStudentPass, 'student', 'Student Verify', 'STUDENT001']
            );
        }

        console.log('Test users ready.');
        console.log(`Admin: ${adminEmail} / ${adminPass}`);
        console.log(`Student: ${studentEmail} / ${studentPass}`);
        process.exit(0);

    } catch (error) {
        console.error('Failed to ensure test users:', error);
        process.exit(1);
    }
};

ensureTestUsers();
