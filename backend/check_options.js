const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/AI WORKSHOP/PracticeHub-2/Practice_hub/.env' });

async function checkMCQOptions() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        const [questions] = await pool.query(`
      SELECT id, title FROM questions 
      WHERE level_id = '660e8400-e29b-41d4-a716-446655440021' 
      AND question_type = 'mcq'
    `);

        for (const q of questions) {
            const [options] = await pool.query("SELECT id, option_text, is_correct FROM mcq_options WHERE question_id = ?", [q.id]);
            console.log(`Question: ${q.title} (${q.id}), Options count: ${options.length}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkMCQOptions();
