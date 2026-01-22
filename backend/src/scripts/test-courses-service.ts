import { getAllCourses } from '../services/courseService';

async function testService() {
    try {
        console.log('Testing getAllCourses service...');
        const courses = await getAllCourses('test-user-id');
        console.log('Service returned courses:', courses.length);
        console.log('Use JSON.stringify to see details:', JSON.stringify(courses, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Service failed:', error);
        process.exit(1);
    }
}

testService();
