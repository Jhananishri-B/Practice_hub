import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
    try {
        console.log('Initializing database...');

        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');

        // With multipleStatements: true, we can execute the whole script at once
        await pool.query(schema);

        console.log('Database initialization completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

initDb();
