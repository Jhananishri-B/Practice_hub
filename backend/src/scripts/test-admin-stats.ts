import { getDashboardStats } from '../services/adminService';

async function testStats() {
    try {
        console.log('Testing getDashboardStats service...');
        const stats = await getDashboardStats();
        console.log('Service returned stats:', JSON.stringify(stats, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Service failed:', error);
        process.exit(1);
    }
}

testStats();
