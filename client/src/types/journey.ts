import { ActivitySummary } from './activity';

export interface JourneyDay {
  title: string;
  content: string;
  activities: string[];
}

export interface JourneyProgress {
  currentDay: number;
  completedDays: number[];
  reflections: {
    [dayId: number]: string;
  };
  partnerSyncStatus: 'synced' | 'waiting' | 'not_synced';
  lastActivity?: {
    type: string;
    timestamp: string;
    description?: string;
  };
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  duration: number;
  days: JourneyDay[];
  progress: JourneyProgress;
  partnerProgress?: JourneyProgress;
  createdAt: string;
  updatedAt: string;
}

// Journey-related constants
export const JOURNEY_STEPS = {
  BEGIN: 'begin',
  ALIGN: 'align',
  SHARE: 'share',
  REFLECT: 'reflect',
} as const;

export interface UpdateJourneyProgressParams {
  journeyId: string;
  day: number;
  reflection?: string;
  completed?: boolean;
}

export type JourneyStep = 'begin' | 'share' | 'reflect' | 'align' | 'focus' | 'complete'; 