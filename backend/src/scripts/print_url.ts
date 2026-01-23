
import { getAllCourses } from '../services/courseService';

async function verify() {
    try {
        const courses = await getAllCourses();
        const htmlCssCourse = courses.find(c => c.title.includes('HTML') || c.title.includes('CSS'));

        if (htmlCssCourse) {
            console.log('URL_START');
            console.log(htmlCssCourse.image_url);
            console.log('URL_END');
        } else {
            console.log('COURSE_NOT_FOUND');
        }
    } catch (error) {
        console.error('ERROR');
    }
}

verify().then(() => process.exit(0));
