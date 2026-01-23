
import pool from '../config/database';

async function migrate() {
    console.log('Starting migration to add image_url columns...');
    const conn = await pool.getConnection();
    try {
        // Add to courses
        try {
            await conn.query('ALTER TABLE courses ADD COLUMN image_url VARCHAR(2048) DEFAULT NULL');
            console.log('✅ Added image_url to courses table');
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ image_url already exists in courses table');
            } else {
                console.error('❌ Failed to add image_url to courses:', err.message);
            }
        }

        // Add to levels
        try {
            await conn.query('ALTER TABLE levels ADD COLUMN image_url VARCHAR(2048) DEFAULT NULL');
            console.log('✅ Added image_url to levels table');
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ image_url already exists in levels table');
            } else {
                console.error('❌ Failed to add image_url to levels:', err.message);
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        conn.release();
    }
}

migrate().then(() => process.exit(0));
