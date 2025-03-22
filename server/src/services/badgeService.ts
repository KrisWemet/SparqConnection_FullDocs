import { IGamification } from '../models/Gamification';

export interface BadgeRequirement {
  type: string;
  name: string;
  description: string;
  icon: string;
  checkRequirement: (stats: IGamification) => boolean;
}

const badgeRequirements: BadgeRequirement[] = [
  {
    type: 'FIRST_STEPS',
    name: 'First Steps',
    description: 'Complete your first daily prompt',
    icon: '🌟',
    checkRequirement: (stats) => stats.daily_responses >= 1
  },
  {
    type: 'QUIZ_MASTER',
    name: 'Quiz Master',
    description: 'Complete 10 quizzes with an average score of 80% or higher',
    icon: '📚',
    checkRequirement: (stats) => stats.total_quizzes_completed >= 10
  },
  {
    type: 'STREAK_CHAMPION',
    name: 'Streak Champion',
    description: 'Maintain a 7-day response streak',
    icon: '🔥',
    checkRequirement: (stats) => stats.current_streak >= 7
  },
  {
    type: 'RELATIONSHIP_GURU',
    name: 'Relationship Guru',
    description: 'Earn 1000 points',
    icon: '💝',
    checkRequirement: (stats) => stats.points >= 1000
  },
  {
    type: 'PERFECT_SCORE',
    name: 'Perfect Score',
    description: 'Get a perfect score on 3 quizzes',
    icon: '🎯',
    checkRequirement: (stats) => stats.perfect_scores >= 3
  },
  {
    type: 'STREAK_KING',
    name: 'Streak King',
    description: 'Maintain a 30-day response streak',
    icon: '👑',
    checkRequirement: (stats) => stats.current_streak >= 30
  },
  {
    type: 'DAILY_DEVOTION',
    name: 'Daily Devotion',
    description: 'Complete 30 daily prompts',
    icon: '❤️',
    checkRequirement: (stats) => stats.daily_responses >= 30
  },
  {
    type: 'QUIZ_EXPLORER',
    name: 'Quiz Explorer',
    description: 'Complete quizzes in all categories',
    icon: '🗺️',
    checkRequirement: (stats) => stats.quiz_categories_completed.length >= 5
  },
  {
    type: 'MOOD_MASTER',
    name: 'Mood Master',
    description: 'Track mood for 14 consecutive days',
    icon: '😊',
    checkRequirement: (stats) => stats.mood_entries >= 14
  },
  {
    type: 'POWER_COUPLE',
    name: 'Power Couple',
    description: 'Earn all other badges',
    icon: '💑',
    checkRequirement: (stats) => stats.badges.length >= 9
  }
];

export const checkForNewBadges = async (stats: IGamification): Promise<BadgeRequirement[]> => {
  const earnedBadgeTypes = new Set(stats.badges.map(badge => badge.type));
  const newBadges = badgeRequirements.filter(badge => 
    !earnedBadgeTypes.has(badge.type) && badge.checkRequirement(stats)
  );
  return newBadges;
};

export const getBadgeDetails = (type: string): BadgeRequirement | undefined => {
  return badgeRequirements.find(badge => badge.type === type);
};

export const getAllBadgeRequirements = (): BadgeRequirement[] => {
  return badgeRequirements;
}; 