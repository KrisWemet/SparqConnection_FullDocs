import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import path from 'path';

// Define log event types
export enum AnalyticsEventType {
  JOURNEY_START = 'JOURNEY_START',
  DAY_COMPLETE = 'DAY_COMPLETE',
  ACTIVITY_COMPLETE = 'ACTIVITY_COMPLETE',
  SKIPPED_ACTIVITY = 'SKIPPED_ACTIVITY',
}

// Define log event interfaces
export interface BaseAnalyticsEvent {
  eventType: AnalyticsEventType;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface JourneyEvent extends BaseAnalyticsEvent {
  journeyId: string;
  journeyTitle: string;
  dayNumber?: number;
}

export interface ActivityEvent extends BaseAnalyticsEvent {
  journeyId: string;
  activityId: string;
  activityTitle: string;
  dayNumber: number;
  duration?: number;
  completionStatus?: 'success' | 'partial' | 'failed';
}

// Configure Winston logger
const logDir = path.join(process.cwd(), 'logs', 'analytics');

const analyticsLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true }),
    format.metadata()
  ),
  defaultMeta: { service: 'sparq-analytics' },
  transports: [
    // Write all logs to analytics.log
    new transports.File({
      filename: path.join(logDir, 'analytics.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // Write all errors to error.log
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Console output for development
    ...(process.env.NODE_ENV !== 'production'
      ? [new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          ),
        })]
      : []),
  ],
});

// Helper functions for logging different event types
export const logJourneyStart = (
  userId: string,
  journeyId: string,
  journeyTitle: string,
  metadata?: Record<string, any>
) => {
  const event: JourneyEvent = {
    eventType: AnalyticsEventType.JOURNEY_START,
    userId,
    journeyId,
    journeyTitle,
    timestamp: new Date().toISOString(),
    metadata,
  };
  analyticsLogger.info('Journey started', event);
};

export const logDayComplete = (
  userId: string,
  journeyId: string,
  journeyTitle: string,
  dayNumber: number,
  metadata?: Record<string, any>
) => {
  const event: JourneyEvent = {
    eventType: AnalyticsEventType.DAY_COMPLETE,
    userId,
    journeyId,
    journeyTitle,
    dayNumber,
    timestamp: new Date().toISOString(),
    metadata,
  };
  analyticsLogger.info('Day completed', event);
};

export const logActivityComplete = (
  userId: string,
  journeyId: string,
  activityId: string,
  activityTitle: string,
  dayNumber: number,
  duration?: number,
  completionStatus: 'success' | 'partial' | 'failed' = 'success',
  metadata?: Record<string, any>
) => {
  const event: ActivityEvent = {
    eventType: AnalyticsEventType.ACTIVITY_COMPLETE,
    userId,
    journeyId,
    activityId,
    activityTitle,
    dayNumber,
    duration,
    completionStatus,
    timestamp: new Date().toISOString(),
    metadata,
  };
  analyticsLogger.info('Activity completed', event);
};

export const logSkippedActivity = (
  userId: string,
  journeyId: string,
  activityId: string,
  activityTitle: string,
  dayNumber: number,
  metadata?: Record<string, any>
) => {
  const event: ActivityEvent = {
    eventType: AnalyticsEventType.SKIPPED_ACTIVITY,
    userId,
    journeyId,
    activityId,
    activityTitle,
    dayNumber,
    timestamp: new Date().toISOString(),
    metadata,
  };
  analyticsLogger.info('Activity skipped', event);
};

// Error logging helper
export const logAnalyticsError = (
  error: Error,
  context: Record<string, any>
) => {
  analyticsLogger.error('Analytics error', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

// Export logger instance for direct use if needed
export default analyticsLogger; 