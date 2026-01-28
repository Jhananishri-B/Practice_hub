const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/AI WORKSHOP/PracticeHub-2/Practice_hub/.env' });

async function findMissingMCQs() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        const [levels] = await pool.query(`
      SELECT l.id, l.level_number, c.title as course_title,
             (SELECT COUNT(*) FROM questions q WHERE q.level_id = l.id AND q.question_type = 'mcq') as mcq_count,
             (SELECT COUNT(*) FROM questions q WHERE q.level_id = l.id AND q.question_type = 'coding') as coding_count
      FROM levels l
      JOIN courses c ON l.course_id = c.id
    `);

        const missing = levels.filter(l => l.mcq_count === 0);
        console.log('Levels missing MCQs:', missing);

        const hasMCQs = levels.filter(l => l.mcq_count > 0);
        console.log('Levels with MCQs:', hasMCQs.length);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

findMissingMCQs();
