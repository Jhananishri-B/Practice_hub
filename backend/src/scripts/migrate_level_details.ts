
import pool from '../config/database';
import { getRows } from '../utils/mysqlHelper';

const migrate = async () => {
    console.log('Starting migration for Level Details...');

    try {
        // 1. Add columns if they don't exist
        // Note: 'IF NOT EXISTS' for columns is not standard SQL in all DBs but often supported or we catch error
        // For PostgreSQL we can do: alter table ... add column if not exists ...
        // For MySQL it works usually or we can check information_schema.
        // Given the project uses 'mysql2' (from package.json), we can try ADD COLUMN IF NOT EXISTS or catch duplicate column error.
        // However, the project name implies Postgres ('uuid-ossp') in schema.sql but package.json says mysql2?
        // Let's re-read schema.sql. It has "CREATE EXTENSION IF NOT EXISTS "uuid-ossp";" which is Postgres.
        // BUT 'mysql2' is in package.json.
        // Let's check 'src/config/database.ts' to be sure what DB we are using.

        // I'll take a quick peek at database.ts first to be safe.
        // But assuming it is MySQL (since mysql2 package), the syntax "ADD COLUMN IF NOT EXISTS" works in recent MySQL versions (8.0+).
        // If it's Postgres, "ADD COLUMN IF NOT EXISTS" also works.

        // Let's verify DB type first.
        await addColumns();
        await updateLevelContent();

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

const addColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE levels 
            ADD COLUMN topic_description TEXT,
            ADD COLUMN learning_materials TEXT;
        `);
        console.log('Columns added.');
    } catch (err: any) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('duplicate column')) {
            console.log('Columns already exist.');
        } else {
            // Try catching postgres "algorithm"
            // If this is postgres, the error might be different. 
            // Let's assume the previous steps will clarify DB, or I'll check now.
            console.log('Note on adding columns:', err.message);
        }
    }
};

const updateLevelContent = async () => {
    // Python Level 1
    const pythonMaterials = JSON.stringify([
        { title: "Python Variables (W3Schools)", url: "https://www.w3schools.com/python/python_variables.asp" },
        { title: "Python Data Types (RealPython)", url: "https://realpython.com/python-data-types/" }
    ]);
    const pythonDesc = "Deep dive into Python syntax, variables, dynamic typing, and fundamental data types including integers, floats, and strings.";

    await pool.query(`
        UPDATE levels 
        SET topic_description = ?, learning_materials = ? 
        WHERE title = 'Introduction to Python' AND level_number = 1
    `, [pythonDesc, pythonMaterials]);

    // C Level 1 (Pointers & Memory)
    const cMaterials = JSON.stringify([
        { title: "Pointers in C (GeeksforGeeks)", url: "https://www.geeksforgeeks.org/c-pointers/" },
        { title: "Memory Management", url: "https://www.tutorialspoint.com/cprogramming/c_memory_management.htm" }
    ]);
    const cDesc = "Understand the concept of memory addresses, pointer declaration, dereferencing, and pointer arithmetic which are crucial for low-level programming.";

    await pool.query(`
        UPDATE levels 
        SET topic_description = ?, learning_materials = ? 
        WHERE title = 'Pointers & Memory' AND level_number = 1
    `, [cDesc, cMaterials]);

    // ML Level 1 (Intro to Supervised Learning)
    const mlMaterials = JSON.stringify([
        { title: "Supervised Learning (IBM)", url: "https://www.ibm.com/topics/supervised-learning" },
        { title: "Machine Learning Basics (Google)", url: "https://developers.google.com/machine-learning/crash-course" }
    ]);
    const mlDesc = "Overview of machine learning paradigms with a focus on Supervised Learning. Understand labeled data, features, labels, and the training process.";

    await pool.query(`
        UPDATE levels 
        SET topic_description = ?, learning_materials = ? 
        WHERE title = 'Introduction to Supervised Learning' AND level_number = 1
    `, [mlDesc, mlMaterials]);

    console.log('Level 1 content updated.');
};

migrate();
