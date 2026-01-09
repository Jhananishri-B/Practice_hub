-- Evolution 3: Skill-Based Practice Engine
-- Created: 2026-01-09
-- Description: Adds skill_practice_attempts table for tracking practice by skill

-- ============================================================================
-- Table: skill_practice_attempts
-- Stores every practice attempt with full details for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_practice_attempts (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    question_id CHAR(36),
    attempt_type VARCHAR(20) NOT NULL,
    
    -- Answer details
    answer_submitted TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    score DECIMAL(5,2) DEFAULT 0,
    
    -- Coding-specific
    language VARCHAR(20),
    test_cases_passed INT DEFAULT 0,
    total_test_cases INT DEFAULT 0,
    execution_time_ms INT,
    
    -- Timing
    time_taken_seconds INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Feedback
    explanation TEXT,
    feedback_shown BOOLEAN DEFAULT FALSE,
    
    -- Mastery impact
    mastery_delta DECIMAL(5,2),
    mastery_before DECIMAL(5,2),
    mastery_after DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL,
    CHECK (attempt_type IN ('mcq', 'coding'))
);

CREATE INDEX idx_practice_attempts_user ON skill_practice_attempts(user_id);
CREATE INDEX idx_practice_attempts_skill ON skill_practice_attempts(skill_id);
CREATE INDEX idx_practice_attempts_time ON skill_practice_attempts(created_at);
CREATE INDEX idx_practice_attempts_type ON skill_practice_attempts(attempt_type);
