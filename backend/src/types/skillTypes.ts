// ============================================================================
// Skill Layer TypeScript Interfaces
// ============================================================================

// Core skill entity
export interface Skill {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    difficultyTier: 'beginner' | 'intermediate' | 'advanced';
    createdAt: Date;
    updatedAt: Date;
}

// Skill prerequisite relationship
export interface SkillPrerequisite {
    id: string;
    skillId: string;
    prerequisiteSkillId: string;
    relationshipType: 'required' | 'recommended' | 'optional';
    createdAt: Date;
}

// Level-to-skill mapping
export interface LevelSkill {
    id: string;
    levelId: string;
    skillId: string;
    contributionType: 'teaches' | 'practices' | 'assesses';
    weight: number; // 1-10
    createdAt: Date;
}

// User's mastery of a skill
export interface UserSkillMastery {
    id: string;
    userId: string;
    skillId: string;
    masteryScore: number; // 0-100
    totalPracticeCount: number;
    successfulPracticeCount: number;
    lastPracticedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Mastery change history record
export interface SkillMasteryHistory {
    id: string;
    userId: string;
    skillId: string;
    previousScore: number;
    newScore: number;
    delta: number;
    sourceSessionId: string | null;
    activityType: 'practice' | 'assessment' | 'decay' | 'manual_adjustment' | 'diagnostic';
    createdAt: Date;
}

// ============================================================================
// Composite Types for API Responses
// ============================================================================

export interface SkillWithMastery extends Skill {
    masteryScore: number;
    practiceCount: number;
    lastPracticedAt: Date | null;
}

export interface SkillWithPrerequisites extends Skill {
    prerequisites: Array<{
        skill: Skill;
        relationshipType: SkillPrerequisite['relationshipType'];
    }>;
}

export interface UserSkillSummary {
    totalSkills: number;
    masteredSkills: number;      // score >= 80
    inProgressSkills: number;    // score 20-79
    notStartedSkills: number;    // score < 20
    averageMastery: number;
    strongestSkills: SkillWithMastery[];
    weakestSkills: SkillWithMastery[];
}

export interface CourseSkillMastery {
    courseId: string;
    courseTitle: string;
    skills: SkillWithMastery[];
    overallMastery: number;
}

// ============================================================================
// Input Types for Service Methods
// ============================================================================

export interface UpdateMasteryInput {
    userId: string;
    skillId: string;
    delta: number;
    isSuccessful: boolean;
    sessionId?: string;
    activityType: SkillMasteryHistory['activityType'];
}

export interface CreateSkillInput {
    name: string;
    description?: string;
    category?: string;
    difficultyTier?: Skill['difficultyTier'];
}

export interface MapLevelSkillInput {
    levelId: string;
    skillId: string;
    contributionType?: LevelSkill['contributionType'];
    weight?: number;
}

export interface AddPrerequisiteInput {
    skillId: string;
    prerequisiteSkillId: string;
    relationshipType?: SkillPrerequisite['relationshipType'];
}

// ============================================================================
// Database Row Types (for mapping from MySQL results)
// ============================================================================

export interface SkillRow {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    difficulty_tier: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserSkillMasteryRow {
    id: string;
    user_id: string;
    skill_id: string;
    mastery_score: number;
    total_practice_count: number;
    successful_practice_count: number;
    last_practiced_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface SkillMasteryHistoryRow {
    id: string;
    user_id: string;
    skill_id: string;
    previous_score: number;
    new_score: number;
    delta: number;
    source_session_id: string | null;
    activity_type: string;
    created_at: Date;
}

// ============================================================================
// Helper Functions for Type Mapping
// ============================================================================

export function mapSkillRowToSkill(row: SkillRow): Skill {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        difficultyTier: row.difficulty_tier as Skill['difficultyTier'],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapMasteryRowToMastery(row: UserSkillMasteryRow): UserSkillMastery {
    return {
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        masteryScore: row.mastery_score,
        totalPracticeCount: row.total_practice_count,
        successfulPracticeCount: row.successful_practice_count,
        lastPracticedAt: row.last_practiced_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
