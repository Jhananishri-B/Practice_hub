
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load env from one level up (where .env is usually located relative to src/scripts)
// Adjust based on where this script is run. Assuming run from backend root.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnection() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined in .env');
        return;
    }

    console.log('Testing connection to:', dbUrl.replace(/:[^:@]*@/, ':****@')); // Hide password

    try {
        const connection = await mysql.createConnection({
            uri: dbUrl,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            },
            connectTimeout: 10000
        });

        console.log('✅ Successfully connected to the database!');
        const [rows] = await connection.execute('SELECT 1 as val');
        console.log('✅ query test result:', rows);
        await connection.end();
    } catch (error: any) {
        console.error('❌ Connection failed:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        if (error.code === 'ECONNRESET') {
            console.error('Hint: ECONNRESET often indicates a network issue. Check if your IP is whitelisted in TiDB Cloud or if the cluster is active.');
        }
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Hint: Check your username and password.');
        }
    }
}

testConnection();
