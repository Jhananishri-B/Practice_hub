import pool from '../src/config/database';
import fs from 'fs';
import path from 'path';

const sqlFiles = [
    'seed_course_content.sql',
    'seed_level_content.sql',
    'seed_ds_cloud_dl.sql',
    'seed_additional_mcqs.sql'
];

async function runAllSeeds() {
    console.log('Running all seed files...\n');

    for (const file of sqlFiles) {
        const sqlPath = path.join(__dirname, '..', 'src', file);

        if (!fs.existsSync(sqlPath)) {
            console.log(`Skipping ${file} - file not found`);
            continue;
        }

        console.log(`\n=== Running ${file} ===`);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        const statements = sqlContent
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('select'));

        let success = 0, skipped = 0, failed = 0;

        for (const stmt of statements) {
            try {
                await pool.query(stmt);
                success++;
            } catch (err: any) {
                if (err.code === 'ER_DUP_ENTRY') {
                    skipped++;
                } else {
                    failed++;
                    console.error(`Error: ${err.message.substring(0, 100)}`);
                }
            }
        }

        console.log(`${file}: ${success} executed, ${skipped} duplicates skipped, ${failed} failed`);
    }

    // Verify counts
    console.log('\n=== VERIFICATION ===');
    const counts = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM courses) as courses,
            (SELECT COUNT(*) FROM levels) as levels,
            (SELECT COUNT(*) FROM questions) as questions,
            (SELECT COUNT(*) FROM mcq_options) as mcq_options,
            (SELECT COUNT(*) FROM test_cases) as test_cases
    `);
    console.log('Database counts:', counts[0]);

    console.log('\n✅ All seeds completed!');
    process.exit(0);
}

runAllSeeds().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
