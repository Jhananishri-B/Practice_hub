import pool from '../src/config/database';
import { getRows } from '../src/utils/mysqlHelper';

async function checkContent() {
    try {
        console.log('Checking course content...\n');

        // Check questions per level
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

        console.log('=== CONTENT BY COURSE/LEVEL ===\n');
        console.log('Course | Level | Title | MCQs | Coding');
        console.log('-------|-------|-------|------|-------');
        qRows.forEach((q: any) => {
            console.log(`${q.course} | ${q.level_number} | ${q.level_title} | ${q.mcqs} | ${q.coding}`);
        });

        // Check levels needing more content
        console.log('\n=== LEVELS NEEDING MORE CONTENT ===');
        const needMore = qRows.filter((q: any) => q.mcqs < 10 || q.coding < 2);
        if (needMore.length === 0) {
            console.log('All levels have >= 10 MCQs and >= 2 coding questions!');
        } else {
            needMore.forEach((q: any) => {
                console.log(`${q.course} Level ${q.level_number}: ${q.mcqs} MCQs (need ${Math.max(0, 10 - q.mcqs)} more), ${q.coding} coding (need ${Math.max(0, 2 - q.coding)} more)`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

checkContent();
