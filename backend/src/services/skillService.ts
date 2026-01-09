import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import {
    Skill,
    SkillRow,
    SkillWithMastery,
    SkillWithPrerequisites,
    CreateSkillInput,
    MapLevelSkillInput,
    AddPrerequisiteInput,
    mapSkillRowToSkill,
} from '../types/skillTypes';

// ============================================================================
// Skill CRUD Operations
// ============================================================================

/**
 * Create a new skill
 */
export const createSkill = async (input: CreateSkillInput): Promise<Skill> => {
    const id = uuidv4();
    const { name, description, category, difficultyTier = 'intermediate' } = input;

    await pool.query(
        `INSERT INTO skills (id, name, description, category, difficulty_tier)
     VALUES (?, ?, ?, ?, ?)`,
        [id, name, description || null, category || null, difficultyTier]
    );

    const result = await pool.query(`SELECT * FROM skills WHERE id = ?`, [id]);
    const rows = getRows(result) as SkillRow[];
    return mapSkillRowToSkill(rows[0]);
};

/**
 * Get all skills
 */
export const getAllSkills = async (): Promise<Skill[]> => {
    const result = await pool.query(
        `SELECT * FROM skills ORDER BY category, name`
    );
    const rows = getRows(result) as SkillRow[];
    return rows.map(mapSkillRowToSkill);
};

/**
 * Get skill by ID
 */
export const getSkillById = async (skillId: string): Promise<Skill | null> => {
    const result = await pool.query(`SELECT * FROM skills WHERE id = ?`, [skillId]);
    const row = getFirstRow(result) as SkillRow | null;
    return row ? mapSkillRowToSkill(row) : null;
};

/**
 * Get skills by category
 */
export const getSkillsByCategory = async (category: string): Promise<Skill[]> => {
    const result = await pool.query(
        `SELECT * FROM skills WHERE category = ? ORDER BY name`,
        [category]
    );
    const rows = getRows(result) as SkillRow[];
    return rows.map(mapSkillRowToSkill);
};

/**
 * Update a skill
 */
export const updateSkill = async (
    skillId: string,
    updates: Partial<CreateSkillInput>
): Promise<Skill | null> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
    }
    if (updates.difficultyTier !== undefined) {
        fields.push('difficulty_tier = ?');
        values.push(updates.difficultyTier);
    }

    if (fields.length === 0) {
        return getSkillById(skillId);
    }

    values.push(skillId);
    await pool.query(
        `UPDATE skills SET ${fields.join(', ')} WHERE id = ?`,
        values
    );

    return getSkillById(skillId);
};

/**
 * Delete a skill
 */
export const deleteSkill = async (skillId: string): Promise<boolean> => {
    const result = await pool.query(`DELETE FROM skills WHERE id = ?`, [skillId]);
    return (result as any).affectedRows > 0;
};

// ============================================================================
// Level-Skill Mapping
// ============================================================================

/**
 * Map a skill to a level
 */
export const mapSkillToLevel = async (input: MapLevelSkillInput): Promise<void> => {
    const id = uuidv4();
    const { levelId, skillId, contributionType = 'teaches', weight = 1 } = input;

    await pool.query(
        `INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE contribution_type = ?, weight = ?`,
        [id, levelId, skillId, contributionType, weight, contributionType, weight]
    );
};

/**
 * Remove skill mapping from a level
 */
export const unmapSkillFromLevel = async (
    levelId: string,
    skillId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM level_skills WHERE level_id = ? AND skill_id = ?`,
        [levelId, skillId]
    );
    return (result as any).affectedRows > 0;
};

/**
 * Get all skills for a level
 */
export const getSkillsForLevel = async (levelId: string): Promise<SkillWithMastery[]> => {
    const result = await pool.query(
        `SELECT s.*, ls.contribution_type, ls.weight
     FROM skills s
     INNER JOIN level_skills ls ON s.id = ls.skill_id
     WHERE ls.level_id = ?
     ORDER BY ls.weight DESC, s.name`,
        [levelId]
    );
    const rows = getRows(result);
    return rows.map((row: any) => ({
        ...mapSkillRowToSkill(row),
        masteryScore: 0,
        practiceCount: 0,
        lastPracticedAt: null,
        contributionType: row.contribution_type,
        weight: row.weight,
    }));
};

/**
 * Get all skills for a course (via levels)
 */
export const getSkillsForCourse = async (courseId: string): Promise<Skill[]> => {
    const result = await pool.query(
        `SELECT DISTINCT s.*
     FROM skills s
     INNER JOIN level_skills ls ON s.id = ls.skill_id
     INNER JOIN levels l ON ls.level_id = l.id
     WHERE l.course_id = ?
     ORDER BY s.category, s.name`,
        [courseId]
    );
    const rows = getRows(result) as SkillRow[];
    return rows.map(mapSkillRowToSkill);
};

// ============================================================================
// Skill Prerequisites
// ============================================================================

/**
 * Add a prerequisite relationship
 */
export const addPrerequisite = async (input: AddPrerequisiteInput): Promise<void> => {
    const id = uuidv4();
    const { skillId, prerequisiteSkillId, relationshipType = 'required' } = input;

    if (skillId === prerequisiteSkillId) {
        throw new Error('A skill cannot be a prerequisite of itself');
    }

    await pool.query(
        `INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE relationship_type = ?`,
        [id, skillId, prerequisiteSkillId, relationshipType, relationshipType]
    );
};

/**
 * Remove a prerequisite relationship
 */
export const removePrerequisite = async (
    skillId: string,
    prerequisiteSkillId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM skill_prerequisites WHERE skill_id = ? AND prerequisite_skill_id = ?`,
        [skillId, prerequisiteSkillId]
    );
    return (result as any).affectedRows > 0;
};

/**
 * Get prerequisites for a skill
 */
export const getPrerequisites = async (skillId: string): Promise<SkillWithPrerequisites | null> => {
    const skill = await getSkillById(skillId);
    if (!skill) return null;

    const result = await pool.query(
        `SELECT s.*, sp.relationship_type
     FROM skills s
     INNER JOIN skill_prerequisites sp ON s.id = sp.prerequisite_skill_id
     WHERE sp.skill_id = ?
     ORDER BY sp.relationship_type, s.name`,
        [skillId]
    );
    const rows = getRows(result);

    return {
        ...skill,
        prerequisites: rows.map((row: any) => ({
            skill: mapSkillRowToSkill(row),
            relationshipType: row.relationship_type,
        })),
    };
};

/**
 * Get all skills that depend on a given skill
 */
export const getDependentSkills = async (skillId: string): Promise<Skill[]> => {
    const result = await pool.query(
        `SELECT s.*
     FROM skills s
     INNER JOIN skill_prerequisites sp ON s.id = sp.skill_id
     WHERE sp.prerequisite_skill_id = ?
     ORDER BY s.name`,
        [skillId]
    );
    const rows = getRows(result) as SkillRow[];
    return rows.map(mapSkillRowToSkill);
};

/**
 * Check if all required prerequisites are met for a skill
 */
export const arePrerequisitesMet = async (
    userId: string,
    skillId: string,
    minimumMastery: number = 50
): Promise<boolean> => {
    const result = await pool.query(
        `SELECT sp.prerequisite_skill_id, COALESCE(usm.mastery_score, 0) as mastery_score
     FROM skill_prerequisites sp
     LEFT JOIN user_skill_mastery usm ON sp.prerequisite_skill_id = usm.skill_id AND usm.user_id = ?
     WHERE sp.skill_id = ? AND sp.relationship_type = 'required'`,
        [userId, skillId]
    );
    const rows = getRows(result);

    // All required prerequisites must meet minimum mastery
    return rows.every((row: any) => row.mastery_score >= minimumMastery);
};
