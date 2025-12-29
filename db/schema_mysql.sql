-- AI Practice Hub Database Schema (MySQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    name VARCHAR(100),
    roll_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (role IN ('student', 'admin'))
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_levels INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    level_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_level (course_id, level_number),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id CHAR(36) PRIMARY KEY,
    level_id CHAR(36) NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    reference_solution TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (question_type IN ('coding', 'mcq')),
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- MCQ Options table
CREATE TABLE IF NOT EXISTS mcq_options (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_letter VARCHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Test Cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    test_case_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Practice Sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    level_id CHAR(36) NOT NULL,
    session_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_limit INTEGER,
    total_questions INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    CHECK (session_type IN ('coding', 'mcq')),
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- Session Questions (many-to-many relationship)
CREATE TABLE IF NOT EXISTS session_questions (
    id CHAR(36) PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    question_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'not_attempted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('not_attempted', 'attempted', 'completed')),
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- User Submissions table
CREATE TABLE IF NOT EXISTS user_submissions (
    id CHAR(36) PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    submission_type VARCHAR(20) NOT NULL,
    submitted_code TEXT,
    selected_option_id CHAR(36),
    language VARCHAR(20),
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    execution_time INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (submission_type IN ('coding', 'mcq')),
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES mcq_options(id)
);

-- Test Case Results table
CREATE TABLE IF NOT EXISTS test_case_results (
    id CHAR(36) PRIMARY KEY,
    submission_id CHAR(36) NOT NULL,
    test_case_id CHAR(36) NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    actual_output TEXT,
    error_message TEXT,
    execution_time INTEGER,
    FOREIGN KEY (submission_id) REFERENCES user_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    level_id CHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'locked',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')),
    UNIQUE KEY unique_user_level (user_id, level_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- User Statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    total_problems_attempted INTEGER DEFAULT 0,
    total_problems_solved INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_practice_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default courses
INSERT INTO courses (id, title, description, total_levels) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Python', 'Master Python from basics to AI implementation', 5),
    ('550e8400-e29b-41d4-a716-446655440002', 'C Programming', 'Deep dive into memory management, pointers, and low-level optimization', 6),
    ('550e8400-e29b-41d4-a716-446655440003', 'Machine Learning', 'Introduction to neural networks, algorithms, and predictive modeling', 10)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default levels for Python
INSERT INTO levels (id, course_id, level_number, title, description) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Introduction to Python', 'Master the basics of Python syntax, variables, and primitive data types'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2, 'Control Flow & Functions', 'Learn to control the flow of execution with loops and conditionals'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 3, 'Data Structures', 'Deep dive into Python core data structures'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 4, 'Object-Oriented Programming', 'Learn classes, objects, and inheritance'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 5, 'Advanced Topics', 'Advanced Python concepts and patterns')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default levels for C
INSERT INTO levels (id, course_id, level_number, title, description) VALUES
    ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 1, 'Pointers & Memory', 'Understand manual memory management essentials'),
    ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 2, 'Structs & Unions', 'Deep dive into custom data types'),
    ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 3, 'Dynamic Memory Mgmt', 'Master malloc, calloc, realloc and free'),
    ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 4, 'File I/O & Preprocessing', 'File operations and preprocessor directives'),
    ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 5, 'Multi-threading', 'Concurrent programming concepts'),
    ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 6, 'SIMD & Vectorization', 'Optimization techniques')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default levels for Machine Learning
INSERT INTO levels (id, course_id, level_number, title, description) VALUES
    ('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 1, 'Introduction to Supervised Learning', 'Foundational concepts of supervised learning algorithms'),
    ('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 2, 'Linear Regression', 'Understanding linear relationships and predictions'),
    ('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 3, 'Logistic Regression & Classification', 'Binary and multiclass classification techniques'),
    ('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 4, 'Decision Trees & Random Forests', 'Tree-based methods and ensemble learning'),
    ('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 5, 'Support Vector Machines (SVM)', 'Hyperplanes and kernel tricks'),
    ('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 6, 'Unsupervised Learning: Clustering', 'K-Means, Hierarchical clustering'),
    ('660e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440003', 7, 'Neural Networks Basics', 'Introduction to neural networks'),
    ('660e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 8, 'Deep Learning', 'Deep neural networks and architectures'),
    ('660e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 9, 'Natural Language Processing', 'NLP concepts and applications'),
    ('660e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 10, 'Computer Vision', 'Image processing and recognition')
ON DUPLICATE KEY UPDATE id=id;

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_level_id ON questions(level_id);
CREATE INDEX idx_test_cases_question_id ON test_cases(question_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_user_submissions_session_id ON user_submissions(session_id);

