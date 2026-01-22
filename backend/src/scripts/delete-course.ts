import pool from '../config/database';

async function deleteCourse() {
    try {
        console.log('Deleting Gen Ai course...');
        const [result] = await pool.query("DELETE FROM courses WHERE title = ?", ['Gen Ai']);
        console.log('Deleted result:', result);
        process.exit(0);
    } catch (error) {
        console.error('Delete failed:', error);
        process.exit(1);
    }
}

deleteCourse();
