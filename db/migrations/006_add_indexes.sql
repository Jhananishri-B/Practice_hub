-- ============================================================================
-- Evolution 9: Performance Indexes
-- Created: 2026-01-09
-- Description: Add indexes for frequently queried columns
-- ============================================================================

-- ============================================================================
-- User Skill Mastery Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_skill_mastery_lookup 
    ON user_skill_mastery(user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_user_skill_mastery_user 
    ON user_skill_mastery(user_id);

CREATE INDEX IF NOT EXISTS idx_user_skill_mastery_score 
    ON user_skill_mastery(mastery_score);

-- ============================================================================
-- Skill Practice Attempts Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_skill_practice_user_skill 
    ON skill_practice_attempts(user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_skill_practice_user 
    ON skill_practice_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_skill_practice_completed 
    ON skill_practice_attempts(completed_at);

CREATE INDEX IF NOT EXISTS idx_skill_practice_type 
    ON skill_practice_attempts(attempt_type);

-- ============================================================================
-- Skill Mastery History Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_mastery_history_user 
    ON skill_mastery_history(user_id);

CREATE INDEX IF NOT EXISTS idx_mastery_history_user_skill 
    ON skill_mastery_history(user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_mastery_history_created 
    ON skill_mastery_history(created_at);

CREATE INDEX IF NOT EXISTS idx_mastery_history_user_date 
    ON skill_mastery_history(user_id, created_at);

-- ============================================================================
-- Diagnostic Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user 
    ON diagnostic_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_status 
    ON diagnostic_sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_session 
    ON diagnostic_responses(session_id);

CREATE INDEX IF NOT EXISTS idx_diagnostic_skill_scores_user 
    ON diagnostic_skill_scores(user_id);

-- ============================================================================
-- Level and Course Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_levels_course 
    ON levels(course_id);

CREATE INDEX IF NOT EXISTS idx_level_skills_level 
    ON level_skills(level_id);

CREATE INDEX IF NOT EXISTS idx_level_skills_skill 
    ON level_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_questions_level 
    ON questions(level_id);

CREATE INDEX IF NOT EXISTS idx_mcq_options_question 
    ON mcq_options(question_id);

-- ============================================================================
-- User Progress Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user 
    ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_level 
    ON user_progress(level_id);

SELECT 'Performance indexes created successfully!' AS status;
