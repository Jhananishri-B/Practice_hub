const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/AI WORKSHOP/PracticeHub-2/Practice_hub/.env' });

async function auditMCQs() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        const [stats] = await pool.query(`
      SELECT 
        c.title as course, 
        l.level_number,
        q.title as question,
        q.id as question_id,
        (SELECT COUNT(*) FROM mcq_options o WHERE o.question_id = q.id) as options_count
      FROM questions q
      JOIN levels l ON q.level_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE q.question_type = 'mcq'
      ORDER BY c.title, l.level_number
    `);

        console.log('MCQ Options Audit:');
        stats.forEach(s => {
            console.log(`[${s.course} L${s.level_number}] ${s.question}: ${s.options_count} options`);
        });

        const missingOptions = stats.filter(s => s.options_count === 0);
        if (missingOptions.length > 0) {
            console.log('\nWARNING: Questions missing options:', missingOptions);
        } else {
            console.log('\nSuccess: All MCQ questions have at least one option.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

auditMCQs();
