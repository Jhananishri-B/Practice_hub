import pool from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function runSeedScript() {
    try {
        const sqlPath = path.join(__dirname, '..', 'src', 'seed_additional_mcqs.sql');
        console.log('Reading SQL file from:', sqlPath);

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolons but handle multi-line statements
        const statements = sqlContent
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            if (stmt.toLowerCase().startsWith('select')) {
                // For SELECT statements, just log
                console.log(`Statement ${i + 1}: ${stmt.substring(0, 50)}...`);
                continue;
            }

            try {
                await pool.query(stmt);
                console.log(`✓ Statement ${i + 1} executed successfully`);
            } catch (err: any) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⊘ Statement ${i + 1}: Duplicate entry (skipped)`);
                } else {
                    console.error(`✗ Statement ${i + 1} failed:`, err.message);
                }
            }
        }

        console.log('\n✅ Seed script completed!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to run seed script:', error);
        process.exit(1);
    }
}

runSeedScript();
