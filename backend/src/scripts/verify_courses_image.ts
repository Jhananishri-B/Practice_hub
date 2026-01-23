
import { getAllCourses } from '../services/courseService';

async function verify() {
    console.log('Verifying getAllCourses...');
    try {
        const courses = await getAllCourses();
        const htmlCssCourse = courses.find(c => c.title.includes('HTML/CSS') || c.title.toLowerCase().includes('html'));

        if (htmlCssCourse) {
            console.log('Found HTML/CSS course:', htmlCssCourse.title);
            console.log('Image URL:', htmlCssCourse.image_url);
            if (htmlCssCourse.image_url) {
                console.log('✅ Image URL is present.');
            } else {
                console.log('❌ Image URL is missing or null.');
            }
        } else {
            console.log('❌ HTML/CSS course not found.');
            console.log('Available courses:', courses.map(c => c.title).join(', '));
        }
    } catch (error) {
        console.error('Error verifying courses:', error);
    }
}

verify().then(() => process.exit(0));
