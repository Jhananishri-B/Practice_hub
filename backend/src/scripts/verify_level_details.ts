
import pool from '../config/database';

const verify = async () => {
    try {
        const [rows] = await pool.query(`
        SELECT title, topic_description, learning_materials 
        FROM levels 
        WHERE level_number = 1
        ORDER BY title
    `);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
