
import pool from '../config/database';
import { getRows } from '../utils/mysqlHelper';

async function checkSchema() {
    console.log('Checking courses table schema...');
    try {
        const result = await pool.query('DESCRIBE courses');
        const rows = getRows(result);
        console.log('Columns in courses table:');
        rows.forEach((row: any) => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        // Check for image_url
        const hasImageUrl = rows.some((row: any) => row.Field === 'image_url');
        if (hasImageUrl) {
            console.log('✅ image_url column EXISTS');
        } else {
            console.log('❌ image_url column MISSING');
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema().then(() => process.exit(0));
