import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  total_levels: number;
}

export interface Level {
  id: string;
  course_id: string;
  level_number: number;
  title: string;
  description: string | null;
  status?: string;
}

export const getAllCourses = async (userId?: string): Promise<Course[]> => {
  const result = await pool.query(
    'SELECT id, title, description, total_levels FROM courses ORDER BY title'
  );
  return result.rows;
};

export const getCourseLevels = async (
  courseId: string,
  userId: string
): Promise<Level[]> => {
  // Get all levels for the course
  const levelsResult = await pool.query(
    `SELECT l.id, l.course_id, l.level_number, l.title, l.description
     FROM levels l
     WHERE l.course_id = $1
     ORDER BY l.level_number`,
    [courseId]
  );

  // Get user progress for this course
  const progressResult = await pool.query(
    `SELECT level_id, status FROM user_progress
     WHERE user_id = $1 AND course_id = $2`,
    [userId, courseId]
  );

  const progressMap = new Map(
    progressResult.rows.map((row) => [row.level_id, row.status])
  );

  // Determine unlock status based on course completion rules
  const courseResult = await pool.query(
    'SELECT title FROM courses WHERE id = $1',
    [courseId]
  );
  const courseTitle = courseResult.rows[0]?.title || '';

  // Check prerequisites
  let unlockedLevels = 0;
  if (courseTitle === 'Machine Learning') {
    // Check if user completed 4 Python levels
    const pythonCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'Python'"
    );
    if (pythonCourse.rows.length > 0) {
      const pythonProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = $1 AND course_id = $2 AND status = 'completed'`,
        [userId, pythonCourse.rows[0].id]
      );
      if (parseInt(pythonProgress.rows[0].count) >= 4) {
        unlockedLevels = 999; // All levels unlocked
      }
    }

    // Also check C course
    const cCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'C Programming'"
    );
    if (cCourse.rows.length > 0) {
      const cProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = $1 AND course_id = $2 AND status = 'completed'`,
        [userId, cCourse.rows[0].id]
      );
      if (parseInt(cProgress.rows[0].count) >= 4) {
        unlockedLevels = 999;
      }
    }
  } else if (courseTitle === 'Python') {
    // Check if user completed 4 C levels
    const cCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'C Programming'"
    );
    if (cCourse.rows.length > 0) {
      const cProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = $1 AND course_id = $2 AND status = 'completed'`,
        [userId, cCourse.rows[0].id]
      );
      if (parseInt(cProgress.rows[0].count) >= 4) {
        unlockedLevels = 999;
      }
    }
  }

  // Initialize user progress for level 1 if not exists
  if (levelsResult.rows.length > 0) {
    const firstLevel = levelsResult.rows[0];
    if (!progressMap.has(firstLevel.id)) {
      await pool.query(
        `INSERT INTO user_progress (user_id, course_id, level_id, status)
         VALUES ($1, $2, $3, 'unlocked')
         ON CONFLICT (user_id, level_id) DO NOTHING`,
        [userId, courseId, firstLevel.id]
      );
      progressMap.set(firstLevel.id, 'unlocked');
    }
  }

  // Map levels with status
  const levels = levelsResult.rows.map((level) => {
    const userStatus = progressMap.get(level.id);
    let status = 'locked';

    // Level 1 is always unlocked
    if (level.level_number === 1) {
      status = userStatus || 'unlocked';
    }
    // If course is fully unlocked (prerequisites met)
    else if (unlockedLevels === 999) {
      status = userStatus || 'unlocked';
    }
    // If user has progress on this level
    else if (userStatus) {
      status = userStatus;
    }
    // Check if previous level is completed
    else {
      const prevLevel = levelsResult.rows.find(
        (l) => l.level_number === level.level_number - 1
      );
      if (prevLevel) {
        const prevStatus = progressMap.get(prevLevel.id);
        if (prevStatus === 'completed') {
          status = 'unlocked';
          // Auto-create progress entry
          pool.query(
            `INSERT INTO user_progress (user_id, course_id, level_id, status)
             VALUES ($1, $2, $3, 'unlocked')
             ON CONFLICT (user_id, level_id) DO NOTHING`,
            [userId, courseId, level.id]
          ).catch(() => {}); // Ignore errors
        }
      }
    }

    return {
      ...level,
      status,
    };
  });

  return levels;
};

