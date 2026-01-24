import pool from '../config/database';
import fs from 'fs';

// Helper to extract rows, simplified versions
const getRows = (result: any) => {
    if (!result) return [];
    if (Array.isArray(result)) return result[0];
    return result;
};

const checkAssets = async () => {
    try {
        const log = (msg: string) => fs.appendFileSync('check_results.txt', msg + '\n');
        fs.writeFileSync('check_results.txt', 'Checking specific question...\n');

        // Query specific question
        const result = await pool.query(`
            SELECT id, title, question_type, output_format, reference_solution 
            FROM questions 
            WHERE id = '444b2171-3a47-46ce-9e3f-94011280bf71'
        `);

        const rows = getRows(result);
        log(`Found ${rows.length} questions.`);

        rows.forEach((row: any) => {
            log('------------------------------------------------');
            log(`ID: ${row.id}`);
            log(`Title: ${row.title}`);
            log(`Type: ${row.question_type}`);
            log(`Output Format: [${row.output_format}]`);

            // Log Reference Solution parsed
            try {
                if (row.reference_solution) {
                    const parsed = JSON.parse(row.reference_solution);
                    log('Reference HTML:');
                    log(parsed.html || 'No HTML');
                } else {
                    log('Reference solution is empty.');
                }
            } catch (e) {
                log('Reference solution is NOT JSON.');
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

checkAssets();
