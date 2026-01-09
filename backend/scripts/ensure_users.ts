import dotenv from 'dotenv';
dotenv.config(); // Load env first

import fs from 'fs';
import path from 'path';

// Manual check of imports
const authServicePath = path.resolve(__dirname, '../src/services/authService.ts');
if (!fs.existsSync(authServicePath)) {
    console.error('File not found:', authServicePath);
    process.exit(1);
}

// Dynamic import to handle potential load order issues
async function run() {
    try {
        console.log('Importing authService...');
        const { createDefaultUsers } = await import('../src/services/authService');

        console.log('Ensuring default users exist...');
        await createDefaultUsers();
        console.log('✅ Default users (USER/ADMIN) verified/created.');
    } catch (err: any) {
        console.error('❌ Error creating users:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        // Need to close pool, but since we dynamically imported, we can't easily access pool unless we import it too
        // But createDefaultUsers uses the pool singleton. 
        // Just force exit after a short delay to allow logs to flush
        setTimeout(() => process.exit(0), 100);
    }
}

run();
