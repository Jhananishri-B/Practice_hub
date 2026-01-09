-- Evolution 6: Diagnostic Entry Test
-- Created: 2026-01-09
-- Description: Tables for diagnostic assessment to generate initial mastery scores

-- ============================================================================
-- Table: diagnostic_sessions
-- Tracks diagnostic test attempts per user
-- ============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    skills_tested INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    recommended_path VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    CHECK (recommended_path IN ('remedial', 'standard', 'accelerated') OR recommended_path IS NULL)
);

CREATE INDEX idx_diagnostic_sessions_user ON diagnostic_sessions(user_id);
CREATE INDEX idx_diagnostic_sessions_status ON diagnostic_sessions(status);

-- ============================================================================
-- Table: diagnostic_responses
-- Stores individual question responses within a diagnostic session
-- ============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_responses (
    id CHAR(36) PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    answer_submitted TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CHECK (question_type IN ('mcq', 'coding'))
);

CREATE INDEX idx_diagnostic_responses_session ON diagnostic_responses(session_id);
CREATE INDEX idx_diagnostic_responses_skill ON diagnostic_responses(skill_id);

-- ============================================================================
-- Table: diagnostic_skill_scores
-- Stores per-skill scores from diagnostic (separate from mastery)
-- ============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_skill_scores (
    id CHAR(36) PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    questions_asked INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    recommended_path VARCHAR(20) DEFAULT 'standard',
    applied_to_mastery BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CHECK (recommended_path IN ('remedial', 'standard', 'accelerated'))
);

CREATE INDEX idx_diagnostic_skill_scores_user ON diagnostic_skill_scores(user_id);
CREATE INDEX idx_diagnostic_skill_scores_skill ON diagnostic_skill_scores(skill_id);
