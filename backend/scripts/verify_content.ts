import pool from '../src/config/database';
import { getRows } from '../src/utils/mysqlHelper';

async function verifyContent() {
    try {
        console.log('Verifying course content...\n');

        // Check levels
        const levels = await pool.query('SELECT l.level_number, l.title, c.title as course FROM levels l JOIN courses c ON l.course_id = c.id ORDER BY c.title, l.level_number');
        const levelRows = getRows(levels);
        console.log('=== LEVELS ===');
        levelRows.forEach(l => console.log(`${l.course} - Level ${l.level_number}: ${l.title}`));

        // Check questions per level
        console.log('\n=== QUESTIONS BY LEVEL ===');
        const questions = await pool.query(`
            SELECT c.title as course, l.level_number, l.title as level_title, 
                   COUNT(CASE WHEN q.question_type = 'mcq' THEN 1 END) as mcqs,
                   COUNT(CASE WHEN q.question_type = 'coding' THEN 1 END) as coding
            FROM courses c
            JOIN levels l ON c.id = l.course_id
            LEFT JOIN questions q ON l.id = q.level_id
            GROUP BY c.title, l.level_number, l.title
            ORDER BY c.title, l.level_number
        `);
        const qRows = getRows(questions);
        qRows.forEach(q => console.log(`${q.course} Level ${q.level_number}: ${q.mcqs} MCQs, ${q.coding} Coding`));

        // Check test cases
        const testCases = await pool.query(`
            SELECT COUNT(*) as count FROM test_cases
        `);
        const tcRows = getRows(testCases);
        console.log(`\n=== TOTAL TEST CASES: ${tcRows[0].count} ===`);

        // Check mcq options
        const options = await pool.query(`
            SELECT COUNT(*) as count FROM mcq_options
        `);
        const optRows = getRows(options);
        console.log(`\n=== TOTAL MCQ OPTIONS: ${optRows[0].count} ===`);

        console.log('\n✅ Verification complete!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyContent();
