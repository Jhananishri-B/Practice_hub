import pool from '../src/config/database';
import { getRows } from '../src/utils/mysqlHelper';

async function cleanAndVerify() {
    console.log('=== Checking questions in database ===\n');

    // Get all questions with their level info
    const questions = await pool.query(`
        SELECT q.id, q.title, q.question_type, c.title as course, l.level_number, l.title as level_title
        FROM questions q
        JOIN levels l ON q.level_id = l.id
        JOIN courses c ON l.course_id = c.id
        ORDER BY c.title, l.level_number, q.question_type
    `);

    const rows = getRows(questions);
    console.log(`Total questions: ${rows.length}\n`);

    // Group by course and level
    const grouped: any = {};
    rows.forEach((r: any) => {
        const key = `${r.course} L${r.level_number} (${r.level_title})`;
        if (!grouped[key]) grouped[key] = { mcq: [], coding: [] };
        grouped[key][r.question_type].push(r.title);
    });

    console.log('=== Questions by Course/Level ===\n');
    for (const key of Object.keys(grouped).sort()) {
        console.log(`${key}:`);
        console.log(`  MCQs (${grouped[key].mcq.length}):`);
        grouped[key].mcq.slice(0, 3).forEach((t: string) => console.log(`    - ${t}`));
        if (grouped[key].mcq.length > 3) console.log(`    ... and ${grouped[key].mcq.length - 3} more`);
        console.log(`  Coding (${grouped[key].coding.length}):`);
        grouped[key].coding.forEach((t: string) => console.log(`    - ${t}`));
        console.log('');
    }

    process.exit(0);
}

cleanAndVerify().catch(e => { console.error(e); process.exit(1); });
