// ============================================================================
// Failure-Aware Learning Types - Evolution 4
// ============================================================================

// Failure analysis result
export interface FailureAnalysis {
    consecutiveFailures: number;      // Current streak of wrong answers
    recentAttempts: number;           // Total attempts in analysis window
    recentCorrect: number;            // Correct attempts in window
    recentAccuracy: number;           // Last N attempts accuracy (0-100)
    isStruggling: boolean;            // true if 3+ consecutive failures
    needsIntervention: boolean;       // true if 5+ failures or <30% accuracy
    suggestedAction: FailureAction;
}

export type FailureAction =
    | 'continue'           // Normal flow
    | 'show_hint'          // Offer subtle hint
    | 'simplify'           // Show simplified explanation
    | 'review_basics'      // Suggest prerequisite review
    | 'take_break';        // Too many failures, suggest break

// Hint response
export interface HintResponse {
    level: 'none' | 'subtle' | 'detailed' | 'review_needed';
    hint: string | null;
    simplifiedExplanation: string | null;
    suggestedReviewSkills: Array<{ id: string; name: string }>;
}

// Common mistake tracking
export interface CommonMistake {
    answer: string;
    count: number;
    percentage: number;
}

// Progression check result
export interface ProgressionCheck {
    canProgress: boolean;
    currentLevelId: string;
    blockerSkills: Array<{
        skillId: string;
        skillName: string;
        currentMastery: number;
        requiredMastery: number;
    }>;
    message: string;
}

// Enhanced submit result with failure awareness
export interface FailureAwareSubmitResult {
    isCorrect: boolean;
    explanation: string | null;
    hint: HintResponse;
    failureAnalysis: FailureAnalysis;
    masteryUpdate: {
        before: number;
        after: number;
        delta: number;
        wasRecoveryBonus: boolean;
    };
}

// Mastery adjustment context
export interface MasteryAdjustmentContext {
    basePoints: number;
    isCorrect: boolean;
    consecutiveFailures: number;
    currentMastery: number;
    difficulty: 'easy' | 'medium' | 'hard';
    attemptType: 'mcq' | 'coding';
}
