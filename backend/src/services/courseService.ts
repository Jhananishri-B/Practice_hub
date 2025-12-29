import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { getRows } from '../utils/mysqlHelper';
import { randomUUID } from 'crypto';

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
  return getRows(result);
};

export const getCourseLevels = async (
  courseId: string,
  userId: string
): Promise<Level[]> => {
  // Get all levels for the course
  const levelsResult = await pool.query(
    `SELECT l.id, l.course_id, l.level_number, l.title, l.description
     FROM levels l
     WHERE l.course_id = ?
     ORDER BY l.level_number`,
    [courseId]
  );

  // Get user progress for this course
  const progressResult = await pool.query(
    `SELECT level_id, status FROM user_progress
     WHERE user_id = ? AND course_id = ?`,
    [userId, courseId]
  );

  const progressRows = getRows(progressResult);
  const progressMap = new Map(
    progressRows.map((row: any) => [row.level_id, row.status])
  );

  // Determine unlock status based on course completion rules
  const courseResult = await pool.query(
    'SELECT title FROM courses WHERE id = ?',
    [courseId]
  );
  const courseRows = getRows(courseResult);
  const courseTitle = courseRows[0]?.title || '';

  // Check prerequisites
  let unlockedLevels = 0;
  if (courseTitle === 'Machine Learning') {
    // Check if user completed 4 Python levels
    const pythonCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'Python'"
    );
    const pythonRows = getRows(pythonCourse);
    if (pythonRows.length > 0) {
      const pythonProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
        [userId, pythonRows[0].id]
      );
      const pythonProgressRows = getRows(pythonProgress);
      if (parseInt(pythonProgressRows[0].count) >= 4) {
        unlockedLevels = 999; // All levels unlocked
      }
    }

    // Also check C course
    const cCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'C Programming'"
    );
    const cRows = getRows(cCourse);
    if (cRows.length > 0) {
      const cProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
        [userId, cRows[0].id]
      );
      const cProgressRows = getRows(cProgress);
      if (parseInt(cProgressRows[0].count) >= 4) {
        unlockedLevels = 999;
      }
    }
  } else if (courseTitle === 'Python') {
    // Check if user completed 4 C levels
    const cCourse = await pool.query(
      "SELECT id FROM courses WHERE title = 'C Programming'"
    );
    const cRows = getRows(cCourse);
    if (cRows.length > 0) {
      const cProgress = await pool.query(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
        [userId, cRows[0].id]
      );
      const cProgressRows = getRows(cProgress);
      if (parseInt(cProgressRows[0].count) >= 4) {
        unlockedLevels = 999;
      }
    }
  }

  // Initialize user progress for level 1 if not exists
  const levelsRows = getRows(levelsResult);
  if (levelsRows.length > 0) {
    const firstLevel = levelsRows[0];
    if (!progressMap.has(firstLevel.id)) {
      const progressId = randomUUID();
      await pool.query(
        `INSERT INTO user_progress (id, user_id, course_id, level_id, status)
         VALUES (?, ?, ?, ?, 'unlocked')
         ON DUPLICATE KEY UPDATE id=id`,
        [progressId, userId, courseId, firstLevel.id]
      );
      progressMap.set(firstLevel.id, 'unlocked');
    }
  }

  // Map levels with status
  const levels = levelsRows.map((level: any) => {
    const userStatus = progressMap.get(level.id);
    let status = 'locked';

    // Level 1 is always unlocked
    if (level.level_number === 1) {
      status = (userStatus as string) || 'unlocked';
    }
    // If course is fully unlocked (prerequisites met)
    else if (unlockedLevels === 999) {
      status = (userStatus as string) || 'unlocked';
    }
    // If user has progress on this level
    else if (userStatus) {
      status = userStatus as string;
    }
    // Check if previous level is completed
    else {
      const prevLevel = levelsRows.find(
        (l: any) => l.level_number === level.level_number - 1
      );
      if (prevLevel) {
        const prevStatus = progressMap.get(prevLevel.id);
        if (prevStatus === 'completed') {
          status = 'unlocked';
          // Auto-create progress entry
          const autoProgressId = randomUUID();
          pool.query(
            `INSERT INTO user_progress (id, user_id, course_id, level_id, status)
             VALUES (?, ?, ?, ?, 'unlocked')
             ON DUPLICATE KEY UPDATE id=id`,
            [autoProgressId, userId, courseId, level.id]
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
