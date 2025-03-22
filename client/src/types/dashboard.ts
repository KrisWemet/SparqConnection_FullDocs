export interface DashboardStats {
  totalActivities: number;
  completedJourneys: number;
  averageEngagement: number;
}

export interface JourneyProgress {
  journeyId: string;
  title: string;
  completionPercentage: number;
  lastActivity: string;
}

export interface ActivitySummary {
  id: string;
  type: 'prompt' | 'quiz' | 'exercise';
  title: string;
  date: string;
  duration: number;
  score?: number;
}

export interface DashboardData {
  activities: ActivitySummary[];
  progress: JourneyProgress[];
  points: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  type: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
} 