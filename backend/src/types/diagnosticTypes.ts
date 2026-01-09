// ============================================================================
// Diagnostic Entry Test Types - Evolution 6
// ============================================================================

export type DiagnosticStatus = 'in_progress' | 'completed' | 'abandoned';
export type RecommendedPath = 'remedial' | 'standard' | 'accelerated';

// Diagnostic session
export interface DiagnosticSession {
    id: string;
    userId: string;
    status: DiagnosticStatus;
    startedAt: Date;
    completedAt: Date | null;
    totalQuestions: number;
    correctAnswers: number;
    skillsTested: number;
    averageScore: number;
    recommendedPath: RecommendedPath | null;
}

// Single response within diagnostic
export interface DiagnosticResponse {
    id: string;
    sessionId: string;
    questionId: string;
    skillId: string;
    questionType: 'mcq' | 'coding';
    answerSubmitted: string | null;
    isCorrect: boolean;
    timeTakenSeconds: number | null;
    createdAt: Date;
}

// Per-skill score from diagnostic
export interface DiagnosticSkillScore {
    id: string;
    sessionId: string;
    userId: string;
    skillId: string;
    skillName?: string;
    questionsAsked: number;
    correctAnswers: number;
    score: number;
    recommendedPath: RecommendedPath;
    appliedToMastery: boolean;
}

// Question for diagnostic
export interface DiagnosticQuestion {
    id: string;
    skillId: string;
    skillName: string;
    type: 'mcq' | 'coding';
    title: string;
    description: string;
    options?: Array<{ id: string; text: string; letter: string }>;
}

// Start diagnostic response
export interface StartDiagnosticResponse {
    sessionId: string;
    questions: DiagnosticQuestion[];
    totalQuestions: number;
    estimatedTime: number; // minutes
}

// Submit answer input
export interface SubmitDiagnosticInput {
    questionId: string;
    answer: string;
    timeTaken?: number;
}

// Submit answer response
export interface SubmitDiagnosticResponse {
    responseId: string;
    isCorrect: boolean;
    questionsRemaining: number;
    currentProgress: number; // percentage
}

// Complete diagnostic response
export interface CompleteDiagnosticResponse {
    sessionId: string;
    overallScore: number;
    skillScores: DiagnosticSkillScore[];
    recommendedPath: RecommendedPath;
    explanation: string;
    nextSteps: string[];
}

// Diagnostic status check
export interface DiagnosticStatusCheck {
    needsDiagnostic: boolean;
    hasCompletedDiagnostic: boolean;
    lastDiagnosticDate: Date | null;
    existingMasteryCount: number;
    message: string;
}
