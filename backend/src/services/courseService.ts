import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { getRows } from '../utils/mysqlHelper';
import { randomUUID } from 'crypto';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  overview: string | null;
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
  try {
    console.log(`[getAllCourses] Fetching all courses for userId: ${userId || 'none'}`);

    // Try to fetch with overview column first
    try {
      const result = await pool.query(
        'SELECT id, title, description, overview, total_levels FROM courses ORDER BY title'
      );
      const courses = getRows(result);
      console.log(`[getAllCourses] Found ${courses.length} courses with overview`);
      return courses || [];
    } catch (queryError: any) {
      // If overview column doesn't exist, fallback to query without it
      if (queryError.code === 'ER_BAD_FIELD_ERROR' || queryError.message?.includes('Unknown column') || queryError.message?.includes('overview')) {
        console.warn('[getAllCourses] Overview column not found, fetching without overview');
        const result = await pool.query(
          'SELECT id, title, description, total_levels FROM courses ORDER BY title'
        );
        const courses = getRows(result);
        // Add null overview to each course
        const coursesWithOverview = (courses || []).map((course: any) => ({
          ...course,
          overview: null
        }));
        console.log(`[getAllCourses] Found ${coursesWithOverview.length} courses without overview`);
        return coursesWithOverview;
      }
      // Re-throw if it's a different error
      throw queryError;
    }
  } catch (error: any) {
    console.error('[getAllCourses] Error fetching courses:', error);
    console.error('[getAllCourses] Error stack:', error.stack);
    // On database timeout, return empty array so frontend doesn't break
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('[getAllCourses] Database timeout/connection error, returning empty array');
      return [];
    }
    // Re-throw other errors so controller can handle them
    throw error;
  }
};

export const getCourseLevels = async (
  courseId: string,
  userId: string
): Promise<Level[]> => {
  try {
    console.log(`[getCourseLevels] Starting for courseId: ${courseId}, userId: ${userId}`);

    // Get all levels for the course
    const levelsResult = await pool.query(
      `SELECT l.id, l.course_id, l.level_number, l.title, l.description, l.topic_description, l.learning_materials
     FROM levels l
     WHERE l.course_id = ?
     ORDER BY l.level_number`,
      [courseId]
    );

    const levelsRows = getRows(levelsResult);
    console.log(`[getCourseLevels] Found ${levelsRows.length} levels for course ${courseId}`);

    if (levelsRows.length === 0) {
      console.warn(`[getCourseLevels] No levels found for course ${courseId}`);
      return [];
    }

    // Get user progress for this course (with error handling)
    let progressMap = new Map<string, string>();
    try {
      const progressResult = await pool.query(
        `SELECT level_id, status FROM user_progress
     WHERE user_id = ? AND course_id = ?`,
        [userId, courseId]
      );
      const progressRows = getRows(progressResult);
      progressMap = new Map(
        progressRows.map((row: any) => [row.level_id, row.status])
      );
      console.log(`[getCourseLevels] Found ${progressRows.length} progress entries for user ${userId}`);
    } catch (progressError: any) {
      console.warn(`[getCourseLevels] Error fetching progress, continuing without progress data:`, progressError.message);
      // Continue without progress data - all levels will be unlocked by default
    }

    // Get course title (with error handling)
    let courseTitle = '';
    try {
      const courseResult = await pool.query(
        'SELECT title FROM courses WHERE id = ?',
        [courseId]
      );
      const courseRows = getRows(courseResult);
      courseTitle = courseRows[0]?.title || '';
    } catch (courseError: any) {
      console.warn(`[getCourseLevels] Error fetching course title:`, courseError.message);
    }

    // Initialize user progress for level 1 if not exists (with error handling)
    try {
      const firstLevel = levelsRows[0];
      if (firstLevel && !progressMap.has(firstLevel.id)) {
        const progressId = randomUUID();
        await pool.query(
          `INSERT INTO user_progress (id, user_id, course_id, level_id, status)
         VALUES (?, ?, ?, ?, 'unlocked')
           ON DUPLICATE KEY UPDATE status='unlocked'`,
          [progressId, userId, courseId, firstLevel.id]
        );
        progressMap.set(firstLevel.id, 'unlocked');
        console.log(`[getCourseLevels] Initialized progress for level 1`);
      }
    } catch (insertError: any) {
      console.warn(`[getCourseLevels] Error inserting progress, continuing:`, insertError.message);
      // Continue even if insert fails - we'll just unlock level 1 by default
    }

    // Map levels with status - simplified logic
    const levels = levelsRows.map((level: any) => {
      const userStatus = progressMap.get(level.id);
      let status = 'locked';

      // Level 1 is always unlocked
      if (level.level_number === 1) {
        status = 'unlocked';
      }
      // If user has progress on this level, use that status
      else if (userStatus) {
        status = userStatus as string;
      }
      // Default to 'unlocked' for all levels
      else {
        status = 'unlocked';
      }

      // Parse topic_description (JSON string) into coreTopics array
      let coreTopics: any[] = [];
      if (level.topic_description) {
        try {
          if (typeof level.topic_description === 'string') {
            // Check if it's a valid JSON string before parsing
            if (level.topic_description.trim().startsWith('{') || level.topic_description.trim().startsWith('[')) {
              const parsed = JSON.parse(level.topic_description);
              // Handle different possible formats
              if (Array.isArray(parsed)) {
                coreTopics = parsed;
              } else if (parsed && typeof parsed === 'object' && parsed.topics) {
                coreTopics = Array.isArray(parsed.topics) ? parsed.topics : [];
              } else if (parsed && typeof parsed === 'object' && parsed.coreTopics) {
                coreTopics = Array.isArray(parsed.coreTopics) ? parsed.coreTopics : [];
              }
            } else {
              console.warn(`[getCourseLevels] topic_description for level ${level.id} is not valid JSON, using as raw string if needed or empty`);
            }
          } else if (Array.isArray(level.topic_description)) {
            coreTopics = level.topic_description;
          }
        } catch (e) {
          console.warn(`[getCourseLevels] Failed to parse topic_description for level ${level.id}:`, e);
          coreTopics = [];
        }
      }

      // Parse learning_materials into materials array
      let materials: any[] = [];
      if (level.learning_materials) {
        try {
          let parsedMaterials: any;
          if (typeof level.learning_materials === 'string') {
            // Check if it's a valid JSON string before parsing
            if (level.learning_materials.trim().startsWith('{') || level.learning_materials.trim().startsWith('[')) {
              parsedMaterials = JSON.parse(level.learning_materials);
            }
          } else {
            parsedMaterials = level.learning_materials;
          }

          // Handle different possible formats
          if (Array.isArray(parsedMaterials)) {
            materials = parsedMaterials;
          } else if (parsedMaterials && typeof parsedMaterials === 'object') {
            // If it's an object with 'resources' or 'materials' key
            if (Array.isArray(parsedMaterials.resources)) {
              materials = parsedMaterials.resources;
            } else if (Array.isArray(parsedMaterials.materials)) {
              materials = parsedMaterials.materials;
            } else if (Array.isArray(parsedMaterials)) {
              materials = parsedMaterials;
            }
          }
        } catch (e) {
          console.warn(`[getCourseLevels] Failed to parse learning_materials for level ${level.id}:`, e);
          materials = [];
        }
      }

      return {
        id: level.id,
        course_id: level.course_id,
        level_number: level.level_number,
        title: level.title,
        description: level.description,
        status,
        coreTopics: coreTopics || [],
        materials: materials || [],
      };
    });

    console.log(`[getCourseLevels] Returning ${levels.length} levels with status`);
    return levels;
  } catch (error: any) {
    console.error('[getCourseLevels] Error:', error);
    console.error('[getCourseLevels] Error stack:', error.stack);
    // On database timeout or any error, return empty array so frontend doesn't break
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('[getCourseLevels] Database timeout/connection error, returning empty array');
      return [];
    }
    // Re-throw other errors so controller can handle them with proper logging
    throw error;
  }
};

export const getLevelDetails = async (levelId: string): Promise<any> => {
  const result = await pool.query(
    'SELECT id, title, description, topic_description, learning_materials, level_number FROM levels WHERE id = ?',
    [levelId]
  );
  const rows = getRows(result);
  if (rows.length === 0) {


    return null;
  }

  const level = rows[0];

  // Parse topic_description (JSON string) into coreTopics array
  let coreTopics: any[] = [];
  if (level.topic_description) {
    try {
      if (typeof level.topic_description === 'string') {
        const parsed = JSON.parse(level.topic_description);
        // Handle different possible formats
        if (Array.isArray(parsed)) {
          coreTopics = parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.topics) {
          coreTopics = Array.isArray(parsed.topics) ? parsed.topics : [];
        } else if (parsed && typeof parsed === 'object' && parsed.coreTopics) {
          coreTopics = Array.isArray(parsed.coreTopics) ? parsed.coreTopics : [];
        }
      } else if (Array.isArray(level.topic_description)) {
        coreTopics = level.topic_description;
      }
    } catch (e) {
      console.warn(`[getLevelDetails] Failed to parse topic_description for level ${levelId}:`, e);
      coreTopics = [];
    }
  }

  // Parse learning_materials into materials array
  let materials: any[] = [];
  if (level.learning_materials) {
    try {
      let parsedMaterials: any;
      if (typeof level.learning_materials === 'string') {
        parsedMaterials = JSON.parse(level.learning_materials);
      } else {
        parsedMaterials = level.learning_materials;
      }

      // Handle different possible formats
      if (Array.isArray(parsedMaterials)) {
        materials = parsedMaterials;
      } else if (parsedMaterials && typeof parsedMaterials === 'object') {
        // If it's an object with 'resources' or 'materials' key
        if (Array.isArray(parsedMaterials.resources)) {
          materials = parsedMaterials.resources;
        } else if (Array.isArray(parsedMaterials.materials)) {
          materials = parsedMaterials.materials;
        } else if (Array.isArray(parsedMaterials)) {
          materials = parsedMaterials;
        }
      }
    } catch (e) {
      console.warn(`[getLevelDetails] Failed to parse learning_materials for level ${levelId}:`, e);
      materials = [];
    }
  }

  return {
    ...level,
    coreTopics: coreTopics || [],
    materials: materials || [],
  };
};
