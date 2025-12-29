import pool from '../config/database';
import { randomUUID } from 'crypto';

export const getAllUsers = async (searchTerm?: string) => {
  let query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.role,
      u.name,
      u.roll_number,
      u.created_at,
      COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.level_id END) as levels_practiced,
      MAX(ps.started_at) as last_practice_date,
      MAX(ps.status) as last_status
    FROM users u
    LEFT JOIN user_progress up ON u.id = up.user_id
    LEFT JOIN practice_sessions ps ON u.id = ps.user_id
    WHERE u.role = 'student'
  `;
  const params: any[] = [];

  if (searchTerm) {
    query += ' AND (u.username ILIKE $1 OR u.name ILIKE $1 OR u.roll_number ILIKE $1)';
    params.push(`%${searchTerm}%`);
  }

  query += ' GROUP BY u.id, u.username, u.email, u.role, u.name, u.roll_number, u.created_at';
  query += ' ORDER BY u.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows.map((row) => ({
    ...row,
    levels_practiced: parseInt(row.levels_practiced) || 0,
  }));
};

export const getRecentActivity = async (searchTerm?: string) => {
  let query = `
    SELECT 
      u.id as user_id,
      u.username,
      u.name,
      u.email,
      u.roll_number,
      c.title as course_title,
      l.title as level_title,
      ps.started_at,
      ps.status,
      ps.session_type
    FROM practice_sessions ps
    JOIN users u ON ps.user_id = u.id
    JOIN courses c ON ps.course_id = c.id
    JOIN levels l ON ps.level_id = l.id
  `;

  const params: any[] = [];
  if (searchTerm) {
    query += ' WHERE u.name ILIKE $1 OR u.roll_number ILIKE $1';
    params.push(`%${searchTerm}%`);
  }

  query += ' ORDER BY ps.started_at DESC LIMIT 50';

  const result = await pool.query(query, params);
  return result.rows;
};

export const getDashboardStats = async () => {
  const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']);
  const activeUsers = await pool.query(
    "SELECT COUNT(DISTINCT user_id) as count FROM practice_sessions WHERE started_at > NOW() - INTERVAL '24 hours'"
  );
  const questionsAttempted = await pool.query('SELECT COUNT(*) as count FROM user_submissions');
  const pendingApprovals = await pool.query(
    "SELECT COUNT(*) as count FROM practice_sessions WHERE status = 'in_progress' AND started_at < NOW() - INTERVAL '2 hours'"
  );

  return {
    total_users: parseInt(totalUsers.rows[0].count),
    active_learners: parseInt(activeUsers.rows[0].count),
    questions_attempted: parseInt(questionsAttempted.rows[0].count),
    pending_approvals: parseInt(pendingApprovals.rows[0].count),
  };
};

export const createCourse = async (data: { title: string; description?: string; total_levels: number }) => {
  const courseId = randomUUID();
  await pool.query(
    'INSERT INTO courses (id, title, description, total_levels) VALUES ($1, $2, $3, $4)',
    [courseId, data.title, data.description || null, data.total_levels]
  );
  return courseId;
};

export const createLevel = async (data: {
  course_id: string;
  level_number: number;
  title: string;
  description?: string;
}) => {
  const levelId = randomUUID();
  await pool.query(
    'INSERT INTO levels (id, course_id, level_number, title, description) VALUES ($1, $2, $3, $4, $5)',
    [levelId, data.course_id, data.level_number, data.title, data.description || null]
  );
  return levelId;
};

export const getCoursesWithLevels = async () => {
  const coursesResult = await pool.query(
    'SELECT id, title, description, total_levels, updated_at, created_at FROM courses ORDER BY title'
  );

  const courses = [];
  for (const course of coursesResult.rows) {
    const levelsResult = await pool.query(
      `SELECT l.id, l.level_number, l.title, l.description, l.time_limit,
              COUNT(q.id) as question_count
       FROM levels l
       LEFT JOIN questions q ON l.id = q.level_id
       WHERE l.course_id = $1
       GROUP BY l.id, l.level_number, l.title, l.description, l.time_limit
       ORDER BY l.level_number`,
      [course.id]
    );

    courses.push({
      ...course,
      levels: levelsResult.rows,
    });
  }

  return courses;
};

export const updateLevelTimeLimit = async (levelId: string, timeLimit: number | null) => {
  await pool.query('UPDATE levels SET time_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
    timeLimit,
    levelId,
  ]);

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = $1)`,
    [levelId]
  );
};

