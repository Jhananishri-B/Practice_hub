-- Skill-Based Foundation Layer Migration
-- Created: 2026-01-09
-- Description: Adds skill tracking tables for personalization, mastery tracking, and adaptive learning

-- ============================================================================
-- Table 1: skills
-- Core skill definitions (e.g., "Loops", "Recursion", "Memory Management")
-- ============================================================================
CREATE TABLE IF NOT EXISTS skills (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    category VARCHAR(50),
    difficulty_tier VARCHAR(20) DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (difficulty_tier IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_difficulty ON skills(difficulty_tier);

-- ============================================================================
-- Table 2: skill_prerequisites
-- Defines prerequisite relationships between skills (DAG for learning paths)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id CHAR(36) PRIMARY KEY,
    skill_id CHAR(36) NOT NULL,
    prerequisite_skill_id CHAR(36) NOT NULL,
    relationship_type VARCHAR(20) DEFAULT 'required',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_skill_prereq (skill_id, prerequisite_skill_id),
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CHECK (relationship_type IN ('required', 'recommended', 'optional')),
    CHECK (skill_id != prerequisite_skill_id)
);

CREATE INDEX idx_skill_prereq_skill ON skill_prerequisites(skill_id);
CREATE INDEX idx_skill_prereq_prereq ON skill_prerequisites(prerequisite_skill_id);

-- ============================================================================
-- Table 3: level_skills
-- Maps existing levels/lessons to skills (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS level_skills (
    id CHAR(36) PRIMARY KEY,
    level_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    contribution_type VARCHAR(50) DEFAULT 'teaches',
    weight INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_level_skill (level_id, skill_id),
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CHECK (contribution_type IN ('teaches', 'practices', 'assesses')),
    CHECK (weight >= 1 AND weight <= 10)
);

CREATE INDEX idx_level_skills_level ON level_skills(level_id);
CREATE INDEX idx_level_skills_skill ON level_skills(skill_id);

-- ============================================================================
-- Table 4: user_skill_mastery
-- Stores per-user, per-skill mastery scores (0-100)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_skill_mastery (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    mastery_score DECIMAL(5,2) DEFAULT 0.00,
    total_practice_count INT DEFAULT 0,
    successful_practice_count INT DEFAULT 0,
    last_practiced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CHECK (mastery_score >= 0 AND mastery_score <= 100)
);

CREATE INDEX idx_user_mastery_user ON user_skill_mastery(user_id);
CREATE INDEX idx_user_mastery_skill ON user_skill_mastery(skill_id);
CREATE INDEX idx_user_mastery_score ON user_skill_mastery(mastery_score);

-- ============================================================================
-- Table 5: skill_mastery_history
-- Audit trail for mastery changes (supports analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_mastery_history (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    previous_score DECIMAL(5,2) NOT NULL,
    new_score DECIMAL(5,2) NOT NULL,
    delta DECIMAL(5,2) NOT NULL,
    source_session_id CHAR(36),
    activity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (source_session_id) REFERENCES practice_sessions(id) ON DELETE SET NULL,
    CHECK (activity_type IN ('practice', 'assessment', 'decay', 'manual_adjustment'))
);

CREATE INDEX idx_mastery_history_user ON skill_mastery_history(user_id);
CREATE INDEX idx_mastery_history_skill ON skill_mastery_history(skill_id);
CREATE INDEX idx_mastery_history_time ON skill_mastery_history(created_at);
