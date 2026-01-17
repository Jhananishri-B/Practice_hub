import pool from '../config/database';
import { randomUUID } from 'crypto';
import { getRows } from '../utils/mysqlHelper';

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
    query += ' AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.name) LIKE LOWER(?) OR LOWER(u.roll_number) LIKE LOWER(?))';
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' GROUP BY u.id, u.username, u.email, u.role, u.name, u.roll_number, u.created_at';
  query += ' ORDER BY u.created_at DESC';

  const result = await pool.query(query, params);
  return getRows(result).map((row: any) => ({
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
    query += ' WHERE LOWER(u.name) LIKE LOWER(?) OR LOWER(u.roll_number) LIKE LOWER(?)';
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ' ORDER BY ps.started_at DESC LIMIT 50';

  const result = await pool.query(query, params);
  return getRows(result);
};

export const getDashboardStats = async () => {
  try {
    console.log('[getDashboardStats] Fetching dashboard stats');
    
    // Get total users (with error handling)
    let totalUsers = 0;
    try {
      const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
      const totalUsersRows = getRows(totalUsersResult);
      totalUsers = parseInt(totalUsersRows[0]?.count || '0');
    } catch (error: any) {
      console.warn('[getDashboardStats] Error fetching total users:', error.message);
    }

    // Get active users (with error handling)
    let activeUsers = 0;
    try {
      const activeUsersResult = await pool.query(
    "SELECT COUNT(DISTINCT user_id) as count FROM practice_sessions WHERE started_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
  );
      const activeUsersRows = getRows(activeUsersResult);
      activeUsers = parseInt(activeUsersRows[0]?.count || '0');
    } catch (error: any) {
      console.warn('[getDashboardStats] Error fetching active users:', error.message);
    }

    // Get questions attempted (with error handling)
    let questionsAttempted = 0;
    try {
      const questionsAttemptedResult = await pool.query('SELECT COUNT(*) as count FROM user_submissions');
      const questionsAttemptedRows = getRows(questionsAttemptedResult);
      questionsAttempted = parseInt(questionsAttemptedRows[0]?.count || '0');
    } catch (error: any) {
      console.warn('[getDashboardStats] Error fetching questions attempted:', error.message);
    }

    // Get pending approvals (with error handling)
    let pendingApprovals = 0;
    try {
      const pendingApprovalsResult = await pool.query(
    "SELECT COUNT(*) as count FROM practice_sessions WHERE status = 'in_progress' AND started_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)"
  );
      const pendingApprovalsRows = getRows(pendingApprovalsResult);
      pendingApprovals = parseInt(pendingApprovalsRows[0]?.count || '0');
    } catch (error: any) {
      console.warn('[getDashboardStats] Error fetching pending approvals:', error.message);
    }

    console.log(`[getDashboardStats] Stats: users=${totalUsers}, active=${activeUsers}, questions=${questionsAttempted}, pending=${pendingApprovals}`);

  return {
      total_users: totalUsers,
      active_learners: activeUsers,
      questions_attempted: questionsAttempted,
      pending_approvals: pendingApprovals,
    };
  } catch (error: any) {
    console.error('[getDashboardStats] Error:', error);
    console.error('[getDashboardStats] Error stack:', error.stack);
    // Return default stats on error
    return {
      total_users: 0,
      active_learners: 0,
      questions_attempted: 0,
      pending_approvals: 0,
  };
  }
};

export const createCourse = async (data: { title: string; description?: string; total_levels: number }) => {
  const courseId = randomUUID();
  await pool.query(
    'INSERT INTO courses (id, title, description, total_levels) VALUES (?, ?, ?, ?)',
    [courseId, data.title, data.description || null, data.total_levels]
  );
  return courseId;
};

export const createLevel = async (data: {
  course_id: string;
  level_number: number;
  title: string;
  description?: string;
  topic_description?: string;
  learning_materials?: string; // or JSON string
}) => {
  const levelId = randomUUID();
  await pool.query(
    'INSERT INTO levels (id, course_id, level_number, title, description, topic_description, learning_materials) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [levelId, data.course_id, data.level_number, data.title, data.description || null, data.topic_description || null, data.learning_materials || null]
  );
  return levelId;
};

export const getCoursesWithLevels = async () => {
  try {
    console.log('[getCoursesWithLevels] Fetching courses with levels');
    
  const coursesResult = await pool.query(
    'SELECT id, title, description, total_levels, updated_at, created_at FROM courses ORDER BY title'
  );

  const courses = [];
  const coursesRows = getRows(coursesResult);
    console.log(`[getCoursesWithLevels] Found ${coursesRows.length} courses`);
    
  for (const course of coursesRows) {
      try {
    const levelsResult = await pool.query(
      `SELECT l.id, l.level_number, l.title, l.description, l.time_limit,
              COUNT(q.id) as question_count
       FROM levels l
       LEFT JOIN questions q ON l.id = q.level_id
       WHERE l.course_id = ?
       GROUP BY l.id, l.level_number, l.title, l.description, l.time_limit
       ORDER BY l.level_number`,
      [course.id]
    );

    courses.push({
      ...course,
          levels: getRows(levelsResult) || [],
        });
      } catch (levelError: any) {
        console.warn(`[getCoursesWithLevels] Error fetching levels for course ${course.id}:`, levelError.message);
        courses.push({
          ...course,
          levels: [],
    });
  }
    }

    console.log(`[getCoursesWithLevels] Returning ${courses.length} courses`);
  return courses;
  } catch (error: any) {
    console.error('[getCoursesWithLevels] Error:', error);
    console.error('[getCoursesWithLevels] Error stack:', error.stack);
    // Return empty array on error
    return [];
  }
};

export const updateLevelTimeLimit = async (levelId: string, timeLimit: number | null) => {
  await pool.query('UPDATE levels SET time_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    timeLimit,
    levelId,
  ]);

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = ?)`,
    [levelId]
  );
};

export const updateLevelDetails = async (
  levelId: string,
  data: {
    description?: string;
    learning_materials?: any;
  }
) => {
  try {
    console.log(`[updateLevelDetails] Updating level ${levelId} with data:`, JSON.stringify(data, null, 2));
    
    // Check if level exists
    const levelCheck = await pool.query('SELECT id FROM levels WHERE id = ?', [levelId]);
    const levelRows = getRows(levelCheck);
    
    if (levelRows.length === 0) {
      console.error(`[updateLevelDetails] Level ${levelId} not found`);
      throw new Error(`Level ${levelId} not found`);
    }
    
  const updates: string[] = [];
  const params: any[] = [];

  if (data.description !== undefined) {
    updates.push('description = ?');
      params.push(data.description || null);
      console.log(`[updateLevelDetails] Adding description update`);
  }

  if (data.learning_materials !== undefined) {
    updates.push('learning_materials = ?');
      // Handle learning_materials - can be object or string
      let learningMaterialsValue: string;
      if (typeof data.learning_materials === 'string') {
        learningMaterialsValue = data.learning_materials;
      } else if (data.learning_materials === null) {
        learningMaterialsValue = null;
      } else {
        learningMaterialsValue = JSON.stringify(data.learning_materials);
      }
      params.push(learningMaterialsValue);
      console.log(`[updateLevelDetails] Adding learning_materials update (length: ${learningMaterialsValue ? learningMaterialsValue.length : 0})`);
  }

    if (updates.length === 0) {
      console.warn(`[updateLevelDetails] No updates to apply for level ${levelId}`);
      return;
    }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const query = `UPDATE levels SET ${updates.join(', ')} WHERE id = ?`;
  params.push(levelId);
    
    console.log(`[updateLevelDetails] Executing query: ${query}`);
    console.log(`[updateLevelDetails] Params:`, params.map(p => typeof p === 'string' && p.length > 100 ? p.substring(0, 100) + '...' : p));

  await pool.query(query, params);
    
    console.log(`[updateLevelDetails] Successfully updated level ${levelId}`);
  } catch (error: any) {
    console.error(`[updateLevelDetails] Error updating level ${levelId}:`, error);
    console.error(`[updateLevelDetails] Error message:`, error.message);
    console.error(`[updateLevelDetails] Error code:`, error.code);
    console.error(`[updateLevelDetails] Error stack:`, error.stack);
    // Re-throw the error so controller can handle it
    throw error;
  }
};
