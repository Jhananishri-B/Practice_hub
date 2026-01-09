// ============================================================================
// Skill Practice Types - Evolution 3
// ============================================================================

// Practice attempt record
export interface PracticeAttempt {
    id: string;
    userId: string;
    skillId: string;
    questionId: string | null;
    attemptType: 'mcq' | 'coding';
    answerSubmitted: string | null;
    isCorrect: boolean;
    score: number;
    language: string | null;
    testCasesPassed: number;
    totalTestCases: number;
    executionTimeMs: number | null;
    timeTakenSeconds: number | null;
    startedAt: Date;
    completedAt: Date | null;
    explanation: string | null;
    feedbackShown: boolean;
    masteryDelta: number | null;
    masteryBefore: number | null;
    masteryAfter: number | null;
    createdAt: Date;
}

// Question with options for practice
export interface PracticeQuestion {
    id: string;
    type: 'mcq' | 'coding';
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    options?: PracticeOption[];  // For MCQ
    testCases?: { input: string; expectedOutput: string; isHidden: boolean }[];  // For coding
}

export interface PracticeOption {
    id: string;
    text: string;
    letter: string;
}

// Start practice response
export interface StartPracticeResponse {
    attemptId: string;
    question: PracticeQuestion;
    skillName: string;
    timeLimit?: number;
}

// MCQ submission result
export interface SubmitMCQResult {
    attemptId: string;
    isCorrect: boolean;
    correctOptionId: string;
    selectedOptionId: string;
    explanation: string | null;
    masteryUpdate: MasteryUpdate;
    timeTaken: number;
}

// Coding submission result
export interface SubmitCodeResult {
    attemptId: string;
    isCorrect: boolean;
    score: number;
    testCasesPassed: number;
    totalTestCases: number;
    testResults: TestCaseResult[];
    explanation: string | null;
    masteryUpdate: MasteryUpdate;
    timeTaken: number;
    executionTime: number;
}

export interface TestCaseResult {
    testCaseNumber: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    isHidden: boolean;
}

export interface MasteryUpdate {
    before: number;
    after: number;
    delta: number;
}

// Practice history item
export interface PracticeHistoryItem {
    attemptId: string;
    skillId: string;
    skillName: string;
    questionTitle: string;
    attemptType: 'mcq' | 'coding';
    isCorrect: boolean;
    score: number;
    timeTaken: number | null;
    masteryDelta: number | null;
    createdAt: Date;
}

// Practice stats for a skill
export interface SkillPracticeStats {
    skillId: string;
    skillName: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageTimeSeconds: number;
    currentMastery: number;
    recentTrend: 'improving' | 'stable' | 'declining';
    lastPracticed: Date | null;
    mcqStats: { attempts: number; correct: number };
    codingStats: { attempts: number; correct: number };
}

// Input types
export interface StartPracticeInput {
    skillId: string;
    questionId?: string;
    attemptType: 'mcq' | 'coding';
}

export interface SubmitMCQInput {
    selectedOptionId: string;
}

export interface SubmitCodeInput {
    code: string;
    language: string;
}

// Database row types
export interface PracticeAttemptRow {
    id: string;
    user_id: string;
    skill_id: string;
    question_id: string | null;
    attempt_type: string;
    answer_submitted: string | null;
    is_correct: boolean;
    score: number;
    language: string | null;
    test_cases_passed: number;
    total_test_cases: number;
    execution_time_ms: number | null;
    time_taken_seconds: number | null;
    started_at: Date;
    completed_at: Date | null;
    explanation: string | null;
    feedback_shown: boolean;
    mastery_delta: number | null;
    mastery_before: number | null;
    mastery_after: number | null;
    created_at: Date;
}

// Helper function to map row to model
export function mapAttemptRowToAttempt(row: PracticeAttemptRow): PracticeAttempt {
    return {
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        questionId: row.question_id,
        attemptType: row.attempt_type as 'mcq' | 'coding',
        answerSubmitted: row.answer_submitted,
        isCorrect: row.is_correct,
        score: row.score,
        language: row.language,
        testCasesPassed: row.test_cases_passed,
        totalTestCases: row.total_test_cases,
        executionTimeMs: row.execution_time_ms,
        timeTakenSeconds: row.time_taken_seconds,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        explanation: row.explanation,
        feedbackShown: row.feedback_shown,
        masteryDelta: row.mastery_delta,
        masteryBefore: row.mastery_before,
        masteryAfter: row.mastery_after,
        createdAt: row.created_at,
    };
}
