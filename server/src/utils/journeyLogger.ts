import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log event types
export enum JourneyEventType {
  START = 'JOURNEY_START',
  DAY_COMPLETE = 'DAY_COMPLETE',
  REFLECTION_SUBMIT = 'REFLECTION_SUBMIT',
  JOURNEY_COMPLETE = 'JOURNEY_COMPLETE',
}

// Define log event interface
export interface JourneyLogEvent {
  eventType: JourneyEventType;
  userId: string;
  journeyId: string;
  dayNumber?: number;
  reflectionLength?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Create the journey logger
const journeyLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'journey-service' },
  transports: [
    // Journey-specific rotating file transport
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'journey-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    // Console transport for development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});

// Helper functions for logging different journey events
export const logJourneyEvent = {
  start: (userId: string, journeyId: string, metadata?: Record<string, any>) => {
    journeyLogger.info('Journey started', {
      eventType: JourneyEventType.START,
      userId,
      journeyId,
      metadata,
      timestamp: new Date(),
    });
  },

  dayComplete: (
    userId: string,
    journeyId: string,
    dayNumber: number,
    metadata?: Record<string, any>
  ) => {
    journeyLogger.info('Day completed', {
      eventType: JourneyEventType.DAY_COMPLETE,
      userId,
      journeyId,
      dayNumber,
      metadata,
      timestamp: new Date(),
    });
  },

  reflectionSubmit: (
    userId: string,
    journeyId: string,
    dayNumber: number,
    reflectionLength: number,
    metadata?: Record<string, any>
  ) => {
    journeyLogger.info('Reflection submitted', {
      eventType: JourneyEventType.REFLECTION_SUBMIT,
      userId,
      journeyId,
      dayNumber,
      reflectionLength,
      metadata,
      timestamp: new Date(),
    });
  },

  journeyComplete: (userId: string, journeyId: string, metadata?: Record<string, any>) => {
    journeyLogger.info('Journey completed', {
      eventType: JourneyEventType.JOURNEY_COMPLETE,
      userId,
      journeyId,
      metadata,
      timestamp: new Date(),
    });
  },
};

// Export the logger for direct use if needed
export default journeyLogger; 