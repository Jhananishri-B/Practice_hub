import pool from '../config/database';

async function findCourse() {
    try {
        console.log('Searching for Gen AI courses...');
        const [rows] = await pool.query("SELECT id, title FROM courses WHERE title LIKE '%Gen%' OR title LIKE '%AI%'");
        console.log('Found courses:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Search failed:', error);
        process.exit(1);
    }
}

findCourse();
