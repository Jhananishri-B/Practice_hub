import pool from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function listCourses() {
    try {
        const [courses]: any = await pool.query(`
      SELECT c.id, c.title, c.total_levels, COUNT(l.id) as real_level_count 
      FROM courses c 
      LEFT JOIN levels l ON c.id = l.course_id 
      GROUP BY c.id, c.title, c.total_levels
    `);

        let output = 'COURSES FOUND:\n';
        courses.forEach((c: any) => {
            output += `${c.title} | Levels: ${c.real_level_count} (DB says ${c.total_levels}) | ID: ${c.id}\n`;
        });

        fs.writeFileSync(path.join(__dirname, 'courses_list.txt'), output);
        console.log('Written to courses_list.txt');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listCourses();
