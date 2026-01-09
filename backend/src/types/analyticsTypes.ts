// ============================================================================
// Learning Analytics Types - Evolution 7
// ============================================================================

// Skill analytics for a user
export interface SkillAnalytics {
    skillId: string;
    skillName: string;
    category: string | null;
    masteryScore: number;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    lastPracticed: Date | null;
    trend: 'improving' | 'stable' | 'declining';
}

// User overview analytics
export interface UserAnalyticsOverview {
    userId: string;
    userName: string;
    totalSkills: number;
    averageMastery: number;
    strongSkillsCount: number;   // mastery >= 80
    moderateSkillsCount: number; // mastery 40-79
    weakSkillsCount: number;     // mastery < 40
    totalAttempts: number;
    overallAccuracy: number;
    currentStreak: number;
    lastActivity: Date | null;
}

// Skill strengths and weaknesses
export interface SkillStrengthsWeaknesses {
    strengths: SkillAnalytics[];
    weaknesses: SkillAnalytics[];
    averageMastery: number;
    totalSkills: number;
}

// Time series data point
export interface TrendDataPoint {
    date: string;
    value: number;
}

// Mastery trend for a skill
export interface SkillMasteryTrend {
    skillId: string;
    skillName: string;
    currentMastery: number;
    dataPoints: TrendDataPoint[];
    changeLastWeek: number;
    changeLastMonth: number;
}

// User mastery trends
export interface UserMasteryTrends {
    userId: string;
    overallTrend: TrendDataPoint[];
    skillTrends: SkillMasteryTrend[];
}

// Accuracy trend
export interface AccuracyTrend {
    period: 'daily' | 'weekly' | 'monthly';
    dataPoints: Array<{
        date: string;
        attempts: number;
        correct: number;
        accuracy: number;
    }>;
    overallAccuracy: number;
}

// Course analytics
export interface CourseAnalytics {
    courseId: string;
    courseTitle: string;
    totalStudents: number;
    averageMastery: number;
    completionRate: number;
    skillBreakdown: Array<{
        skillId: string;
        skillName: string;
        averageMastery: number;
        studentsAtRisk: number;
    }>;
}

// Student summary for faculty view
export interface StudentSummary {
    userId: string;
    userName: string;
    email: string;
    averageMastery: number;
    totalAttempts: number;
    accuracy: number;
    weakSkillsCount: number;
    lastActivity: Date | null;
    isAtRisk: boolean;
}

// At-risk student
export interface AtRiskStudent {
    userId: string;
    userName: string;
    email: string;
    weakSkillsCount: number;
    weakSkills: Array<{ skillId: string; skillName: string; mastery: number }>;
    averageMastery: number;
    recentTrend: 'improving' | 'stable' | 'declining';
    daysInactive: number;
}

// At-risk response
export interface AtRiskResponse {
    totalAtRisk: number;
    threshold: { minWeakSkills: number; maxMastery: number };
    students: AtRiskStudent[];
}

// Chart-ready formats
export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        color?: string;
    }>;
}
