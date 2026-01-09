import pool from '../src/config/database';

async function listCourses() {
    try {
        const [courses]: any = await pool.query(`
      SELECT c.id, c.title, c.total_levels, COUNT(l.id) as real_level_count 
      FROM courses c 
      LEFT JOIN levels l ON c.id = l.course_id 
      GROUP BY c.id, c.title, c.total_levels
    `);
        console.log(JSON.stringify(courses, null, 2));

        // Check columns
        const [columns]: any = await pool.query(`SHOW COLUMNS FROM courses`);
        console.log('Columns:', columns.map((c: any) => c.Field));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listCourses();
