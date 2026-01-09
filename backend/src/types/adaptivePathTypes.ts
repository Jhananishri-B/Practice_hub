// ============================================================================
// Adaptive Learning Path Types - Evolution 5
// ============================================================================

export type PathType = 'remedial' | 'standard' | 'accelerated';
export type PathSubType = 'critical' | 'moderate' | 'normal' | 'fast' | 'expert';

// Path decision for a single skill
export interface AdaptivePathDecision {
    skillId: string;
    skillName: string;
    currentMastery: number;
    pathType: PathType;
    pathSubType: PathSubType;
    reason: string;
    recommendations: LevelRecommendation[];
}

// Level recommendation
export interface LevelRecommendation {
    levelId: string;
    levelTitle: string;
    levelNumber: number;
    courseId: string;
    courseTitle: string;
    action: 'required' | 'recommended' | 'optional' | 'skip';
    priority: number;
    estimatedTime: number; // minutes
    skillsAddressed: string[];
}

// User's full learning path
export interface UserLearningPath {
    userId: string;
    overallPathType: PathType;
    overallMastery: number;
    skillPaths: AdaptivePathDecision[];
    nextRecommendedLessons: LevelRecommendation[];
    explanation: string;
    generatedAt: Date;
}

// Course-specific path
export interface CourseLearningPath {
    courseId: string;
    courseTitle: string;
    overallPathType: PathType;
    courseMastery: number;
    skillPaths: AdaptivePathDecision[];
    recommendedLessons: LevelRecommendation[];
    explanation: string;
}

// Next steps summary
export interface NextSteps {
    immediateAction: LevelRecommendation | null;
    upcomingLessons: LevelRecommendation[];
    skillsToFocus: Array<{ id: string; name: string; mastery: number }>;
    overallMessage: string;
}

// Path thresholds configuration
export interface PathThresholds {
    remedialCritical: number;   // < this = critical remedial
    remedialModerate: number;   // < this = moderate remedial
    standard: number;           // < this = standard
    acceleratedFast: number;    // < this = fast track
    acceleratedExpert: number;  // >= this = expert
}

export const DEFAULT_PATH_THRESHOLDS: PathThresholds = {
    remedialCritical: 40,
    remedialModerate: 60,
    standard: 80,
    acceleratedFast: 90,
    acceleratedExpert: 90,
};
