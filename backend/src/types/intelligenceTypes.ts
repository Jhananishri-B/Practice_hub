// ============================================================================
// Learning Intelligence Types - Evolution 10
// ============================================================================

// Learning metrics for a user-skill pair
export interface LearningMetrics {
    userId: string;
    skillId: string;
    skillName?: string;

    // Time metrics
    avgTimePerAttempt: number;
    totalTimeSpent: number;

    // Frequency metrics
    attemptFrequency: number;
    daysActive: number;
    lastAttemptAt: Date | null;

    // Performance metrics
    successRate: number;
    recentSuccessRate: number;
    currentStreak: number;
    bestStreak: number;

    // Velocity metrics
    improvementVelocity: number;
    acceleration: number;

    // Engagement
    engagementScore: number;
    consistencyScore: number;

    // Predictions
    predictedMastery7d: number | null;
    predictedMastery14d: number | null;
    predictedMastery30d: number | null;
    estimatedMasteryDate: Date | null;

    // Risk
    isAtRisk: boolean;
    riskFactors: string[];

    computedAt: Date;
}

// Skill recommendation
export interface SkillRecommendation {
    skillId: string;
    skillName: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTimeMinutes: number;
    currentMastery: number;
    targetMastery: number;
    recommendationType: 'weakness' | 'prerequisite' | 'next_step' | 'review' | 'challenge';
}

// Personalized recommendations response
export interface PersonalizedRecommendations {
    userId: string;
    generatedAt: Date;
    focusSkills: SkillRecommendation[];    // Top priority skills
    reviewSkills: SkillRecommendation[];   // Skills needing review
    challengeSkills: SkillRecommendation[]; // Ready for advancement
    dailyGoal: {
        skillId: string;
        skillName: string;
        exercisesRemaining: number;
        estimatedMinutes: number;
    } | null;
}

// Mastery forecast for a skill
export interface MasteryForecast {
    skillId: string;
    skillName: string;
    currentMastery: number;
    predicted7d: number;
    predicted14d: number;
    predicted30d: number;
    estimatedMasteryDate: Date | null;
    velocity: number;
    confidence: 'high' | 'medium' | 'low';
    trend: 'improving' | 'stable' | 'declining';
}

// User forecast response
export interface UserForecast {
    userId: string;
    generatedAt: Date;
    overallTrend: 'improving' | 'stable' | 'declining';
    averageVelocity: number;
    skillForecasts: MasteryForecast[];
    projectedCompletionDate: Date | null;
}

// Learning insight
export interface LearningInsight {
    type: 'strength' | 'weakness' | 'pattern' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    data?: Record<string, any>;
    actionable: boolean;
    suggestedAction?: string;
}

// User insights response
export interface UserInsights {
    userId: string;
    generatedAt: Date;
    engagementScore: number;
    consistencyScore: number;
    learningStyle: 'fast' | 'steady' | 'methodical';
    insights: LearningInsight[];
    strengths: string[];
    areasForImprovement: string[];
}

// Faculty alert
export interface FacultyAlert {
    id: string;
    userId: string;
    userName: string;
    skillId: string | null;
    skillName: string | null;
    courseId: string | null;
    alertType: 'at_risk' | 'declining' | 'inactive' | 'struggling' | 'exceptional';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendedAction: string;
    status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
    createdAt: Date;
}

// Faculty alerts response
export interface FacultyAlertsResponse {
    totalAlerts: number;
    newAlerts: number;
    alerts: FacultyAlert[];
    summary: {
        atRisk: number;
        declining: number;
        inactive: number;
        struggling: number;
    };
}

// Intervention recommendation
export interface InterventionRecommendation {
    studentId: string;
    studentName: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    issue: string;
    suggestedIntervention: string;
    estimatedImpact: 'high' | 'medium' | 'low';
    affectedSkills: string[];
}

// Cohort analytics
export interface CohortPrediction {
    cohortId: string;
    cohortName: string;
    totalStudents: number;
    averageMastery: number;
    predictedCompletion: {
        in7Days: number;  // % of students
        in14Days: number;
        in30Days: number;
    };
    atRiskCount: number;
    topPerformers: number;
    needsAttention: number;
}
