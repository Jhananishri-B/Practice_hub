import pool from '../src/config/database';
import { getRows } from '../src/utils/mysqlHelper';

async function countAll() {
    const qResult = await pool.query('SELECT COUNT(*) as cnt FROM questions');
    const oResult = await pool.query('SELECT COUNT(*) as cnt FROM mcq_options');
    const tResult = await pool.query('SELECT COUNT(*) as cnt FROM test_cases');
    const cResult = await pool.query('SELECT COUNT(*) as cnt FROM courses');
    const lResult = await pool.query('SELECT COUNT(*) as cnt FROM levels');

    console.log('Courses:', getRows(cResult)[0]?.cnt || 0);
    console.log('Levels:', getRows(lResult)[0]?.cnt || 0);
    console.log('Questions:', getRows(qResult)[0]?.cnt || 0);
    console.log('MCQ Options:', getRows(oResult)[0]?.cnt || 0);
    console.log('Test Cases:', getRows(tResult)[0]?.cnt || 0);
    process.exit(0);
}

countAll().catch(e => { console.error(e); process.exit(1); });
