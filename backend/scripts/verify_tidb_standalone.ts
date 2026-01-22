import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, 'tidb_verify_output.txt');
function log(msg: string) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function main() {
    fs.writeFileSync(logFile, 'Starting verification...\n');
    const config = {
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: 'h5q6pohuKN2GBRF.root',
        password: 'RHGiEhQLB6Kqq4gY',
        database: 'test',
        ssl: {
            ca: fs.readFileSync(path.join(__dirname, '../tidb-ca.pem')),
            rejectUnauthorized: true
        }
    };

    log('Connecting to TiDB with config host: ' + config.host);
    try {
        const connection = await mysql.createConnection(config);
        log('Connected successfully!');

        const [tables] = await connection.query('SHOW TABLES');
        log('Tables found: ' + JSON.stringify(tables));

        if ((tables as any[]).length > 0) {
            // Correctly handling the RowDataPacket object structure
            const firstRow = (tables as any[])[0];
            const firstTableName = Object.values(firstRow)[0] as string;
            log(`Checking rows in ${firstTableName}...`);
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${firstTableName}`);
            log(`Rows in ${firstTableName}: ${JSON.stringify(rows)}`);
        } else {
            log('Database is empty (no tables found).');
        }

        await connection.end();
    } catch (err: any) {
        log('Connection failed!');
        log('Message: ' + err.message);
        log('Code: ' + err.code);
        log('Stack: ' + err.stack);
    }
}

main();
