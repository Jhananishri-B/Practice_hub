// ============================================================================
// Onboarding Types - Zero-Level Onboarding (Evolution 2)
// ============================================================================

export interface OnboardingStatus {
    isBeginner: boolean;           // true = zero mastery on any skill
    needsGuidance: boolean;        // true = low engagement (< 20 avg mastery)
    engagementLevel: 'new' | 'exploring' | 'active' | 'proficient';
    daysActive: number;
    masteredSkillsCount: number;
    totalSessionsCount: number;
    suggestedAction: 'start_fundamentals' | 'continue_course' | 'try_new_skill' | null;
    message: string;
}

export interface FoundationLesson {
    levelId: string;
    levelTitle: string;
    levelNumber: number;
    courseId: string;
    courseTitle: string;
    skillsTaught: string[];
    priority: number;           // 1 = highest priority
    reason: string;             // explanation for recommendation
}

export interface LearningPathStep {
    stepNumber: number;
    action: 'complete_level' | 'practice_skill';
    targetId: string;
    targetTitle: string;
    courseTitle: string;
    completed: boolean;
    skillsToGain: string[];
}

export interface LearningPath {
    title: string;
    description: string;
    steps: LearningPathStep[];
    estimatedDuration: string;
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
}

// Row types for database results
export interface BeginnerCheckRow {
    mastered_skills: number;
}

export interface SessionCountRow {
    session_count: number;
}

export interface UserCreatedRow {
    created_at: Date;
}
