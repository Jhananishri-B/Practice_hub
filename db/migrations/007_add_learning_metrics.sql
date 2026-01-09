-- ============================================================================
-- Evolution 10: Learning Metrics Table
-- Created: 2026-01-09
-- Description: Store computed learning metrics for intelligence features
-- ============================================================================

-- ============================================================================
-- Learning Metrics Table
-- Stores computed engagement and velocity scores per user-skill
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_metrics (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    
    -- Time metrics
    avg_time_per_attempt FLOAT DEFAULT 0,          -- Average seconds per attempt
    total_time_spent FLOAT DEFAULT 0,              -- Total seconds on this skill
    
    -- Frequency metrics
    attempt_frequency FLOAT DEFAULT 0,             -- Attempts per day (rolling 7 days)
    days_active INT DEFAULT 0,                     -- Days with at least 1 attempt
    last_attempt_at TIMESTAMP NULL,
    
    -- Performance metrics
    success_rate FLOAT DEFAULT 0,                  -- Correct / Total attempts
    recent_success_rate FLOAT DEFAULT 0,           -- Last 10 attempts
    streak_current INT DEFAULT 0,                  -- Current correct streak
    streak_best INT DEFAULT 0,                     -- Best ever streak
    
    -- Velocity metrics
    improvement_velocity FLOAT DEFAULT 0,          -- Mastery change per day
    acceleration FLOAT DEFAULT 0,                  -- Change in velocity
    
    -- Engagement metrics
    engagement_score FLOAT DEFAULT 0,              -- 0-100 composite score
    consistency_score FLOAT DEFAULT 0,             -- How regularly they practice
    
    -- Prediction data
    predicted_mastery_7d FLOAT DEFAULT NULL,       -- Predicted mastery in 7 days
    predicted_mastery_14d FLOAT DEFAULT NULL,      -- Predicted mastery in 14 days
    predicted_mastery_30d FLOAT DEFAULT NULL,      -- Predicted mastery in 30 days
    estimated_mastery_date DATE NULL,              -- When they'll reach 80% mastery
    
    -- Risk indicators
    is_at_risk BOOLEAN DEFAULT FALSE,              -- Flagged as at-risk
    risk_factors JSON NULL,                        -- Array of risk reasons
    
    -- Metadata
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY idx_user_skill (user_id, skill_id),
    KEY idx_user_metrics (user_id),
    KEY idx_at_risk (is_at_risk),
    KEY idx_engagement (engagement_score),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ============================================================================
-- Faculty Alerts Table
-- Store alerts and intervention recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS faculty_alerts (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,                     -- Student being alerted about
    skill_id CHAR(36) NULL,                        -- Related skill (if applicable)
    course_id CHAR(36) NULL,                       -- Related course (if applicable)
    
    alert_type ENUM('at_risk', 'declining', 'inactive', 'struggling', 'exceptional') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Intervention suggestion
    recommended_action TEXT,
    action_taken BOOLEAN DEFAULT FALSE,
    action_notes TEXT,
    
    -- Status
    status ENUM('new', 'acknowledged', 'resolved', 'dismissed') DEFAULT 'new',
    acknowledged_by CHAR(36) NULL,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_user_alerts (user_id),
    KEY idx_status (status),
    KEY idx_severity (severity),
    KEY idx_created (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT 'Learning metrics and faculty alerts tables created!' AS status;
