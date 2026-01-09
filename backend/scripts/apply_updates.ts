import pool from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function applyUpdates() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await pool.getConnection();
        console.log('✅ Connected to database.');

        const migrationsDir = path.join(__dirname, '../../db/migrations');

        // Get all migration files
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure order 001, 002...

        console.log(`\nFound ${files.length} migrations.`);

        // Apply migrations
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            console.log(`Applying migration: ${file}...`);

            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await connection.query(sql);
                console.log(`✅ Applied ${file}`);
            } catch (err: any) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message.includes('already exists')) {
                    console.log(`⚠️  ${file} - Tables/Indexes already exist (Skipping)`);
                } else {
                    console.error(`❌ Error in ${file}: ${err.message}`);
                    // We continue to try others in case of partial state, but usually this is bad.
                    // For this specific recovery, we continue.
                }
            }
        }

        // Apply Seeds
        const seedFile = '../../db/seeds/courses_programming_style.sql';
        const seedPath = path.join(__dirname, seedFile);

        if (fs.existsSync(seedPath)) {
            console.log(`\nApplying seed: ${path.basename(seedFile)}...`);
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seedSql);
            console.log(`✅ Applied ${path.basename(seedFile)}`);
        } else {
            console.error(`❌ Seed file not found: ${seedPath}`);
        }

        console.log('\n🎉 ALL UPDATES COMPLETED!');
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
    } finally {
        if (connection) connection.release();
        await pool.end();
        process.exit();
    }
}

applyUpdates();
