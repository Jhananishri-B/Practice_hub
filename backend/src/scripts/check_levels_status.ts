import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';

async function check() {
    try {
        const [courses] = await pool.query<RowDataPacket[]>('SELECT id, title, total_levels FROM courses');
        let output = '--- Course Level Check ---\n';
        for (const c of courses) {
            const [levels] = await pool.query<RowDataPacket[]>('SELECT count(*) as count FROM levels WHERE course_id = ?', [c.id]);
            output += `${c.title}: total_levels=${c.total_levels}, actual_levels=${levels[0].count}\n`;
        }
        output += '--------------------------\n';
        fs.writeFileSync('levels_status.txt', output);
        console.log('Done writing to levels_status.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
