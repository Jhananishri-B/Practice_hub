import pool from '../src/config/database';

async function deleteCourse() {
    const courseId = '3e11b88c-ed27-11f0-8e4e-329369cf3b6e';
    try {
        console.log(`Deleting course ${courseId}...`);
        // Delete dependencies first (though CASCADE should handle it, explicit is safer if schema varies)
        // But schema says ON DELETE CASCADE for levels, etc.
        // user_skill_mastery might not cascade from course?
        // user_progress links to course.

        // Just delete course.
        const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);
        console.log('Deleted course. Affected rows:', (result as any).affectedRows);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deleteCourse();
