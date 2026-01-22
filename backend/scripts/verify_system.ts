
import pool from '../src/config/database';

async function verifySystem() {
    try {
        console.log('--- System Verification ---');

        // 1. Check Users
        const [users]: any = await pool.query('SELECT email, role, id FROM users');
        console.log(`\nUsers Found: ${users.length}`);
        users.forEach((u: any) => console.log(` - ${u.email} (${u.role})`));

        // 2. Check Courses
        const [courses]: any = await pool.query('SELECT id, title, total_levels FROM courses');
        console.log(`\nCourses Found: ${courses.length}`);
        courses.forEach((c: any) => console.log(` - ${c.title} (Levels: ${c.total_levels})`));

        // 3. Check Levels/Questions
        const [levels]: any = await pool.query('SELECT COUNT(*) as count FROM levels');
        console.log(`\nTotal Levels: ${levels[0].count}`);

        console.log('\n--- End Verification ---');
        process.exit(0);
    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    }
}

verifySystem();
