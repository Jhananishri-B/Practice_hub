
import pool from '../src/config/database';

async function checkTables() {
    try {
        console.log('Connecting to database...');
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables:', rows);

        for (const row of (rows as any[])) {
            const tableName = Object.values(row)[0] as string;
            const [countRows] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`Table ${tableName}: ${(countRows as any[])[0].count} rows`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
