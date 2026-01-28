const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/AI WORKSHOP/PracticeHub-2/Practice_hub/.env' });

async function checkQuestions() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        const [courses] = await pool.query("SELECT id, title FROM courses WHERE title = 'Machine Learning'");
        console.log('Courses:', courses);

        if (courses.length > 0) {
            const courseId = courses[0].id;
            const [levels] = await pool.query("SELECT id, level_number, title FROM levels WHERE course_id = ?", [courseId]);
            console.log('Levels for ML:', levels);

            for (const level of levels) {
                const [questions] = await pool.query("SELECT id, question_type, title FROM questions WHERE level_id = ?", [level.id]);
                console.log(`Questions for Level ${level.level_number} (${level.id}):`, questions);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkQuestions();
