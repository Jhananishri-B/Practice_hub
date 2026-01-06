
import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
    try {
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../../../db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon, but handle cases where semicolon is inside text?
        // Simple split usually works for this schema as it's cleaner.
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} SQL statements. Executing...`);

        for (const statement of statements) {
            // Check for DELIMITER logic if complex triggers used (none here)
            try {
                await pool.query(statement);
            } catch (err: any) {
                // Ignore "Table already exists" or "Duplicate Column" if benign
                // But generally clean handling is better.
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
                    // console.log('Skipping existing object');
                } else {
                    console.warn(`Error executing statement: ${statement.substring(0, 50)}... -> ${err.message}`);
                }
            }
        }

        // Ensure code_snippet column exists (in case table existed but column didn't)
        try {
            console.log("Verifying 'code_snippet' column in 'levels' table...");
            await pool.query("ALTER TABLE levels ADD COLUMN code_snippet TEXT");
            console.log("'code_snippet' column added.");
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'code_snippet' column already exists.");
            } else {
                console.error("Error adding code_snippet column:", e.message);
            }
        }

        console.log('Database schema initialization complete.');
        process.exit(0);

    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

initDb();
