
import mysql from 'mysql2/promise';

async function main() {
    const config = {
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: 'h5q6pohuKN2GBRF.root',
        password: 'RHGiEhQLB6Kqq4gY',
        database: 'test',
        ssl: {
            rejectUnauthorized: false
        }
    };

    console.log('Connecting...');
    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected!');

        const [dbs] = await connection.query('SHOW DATABASES');
        console.log('Databases:', JSON.stringify(dbs, null, 2));

        // Check tables in 'test'
        const [tables] = await connection.query('SHOW TABLES FROM test');
        console.log('Tables in test:', JSON.stringify(tables, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
