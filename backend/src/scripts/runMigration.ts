
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const runMigration = async () => {
    let connection;
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not found');

        // Parse DB URL
        const url = new URL(dbUrl);
        const connectionConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            multipleStatements: true,
            ssl: { rejectUnauthorized: false } // For TiDB
        };

        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        const migrationSql = fs.readFileSync(path.join(__dirname, '../../migrations/add_image_url.sql'), 'utf8');

        // Split into individual statements since TiDB might have issues with multiple ALTERs in one go via specific drivers, 
        // but multpleStatements keys works. Just to be safe, logs specific.
        console.log('Running migration...');
        await connection.query(migrationSql);
        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
};

runMigration();
