import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
// Define log event types
export var JourneyEventType;
(function (JourneyEventType) {
    JourneyEventType["START"] = "JOURNEY_START";
    JourneyEventType["DAY_COMPLETE"] = "DAY_COMPLETE";
    JourneyEventType["REFLECTION_SUBMIT"] = "REFLECTION_SUBMIT";
    JourneyEventType["JOURNEY_COMPLETE"] = "JOURNEY_COMPLETE";
})(JourneyEventType || (JourneyEventType = {}));
// Create the journey logger
const journeyLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'journey-service' },
    transports: [
        // Journey-specific rotating file transport
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'journey-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        // Console transport for development
        ...(process.env.NODE_ENV !== 'production'
            ? [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                }),
            ]
            : []),
    ],
});
// Helper functions for logging different journey events
export const logJourneyEvent = {
    start: (userId, journeyId, metadata) => {
        journeyLogger.info('Journey started', {
            eventType: JourneyEventType.START,
            userId,
            journeyId,
            metadata,
            timestamp: new Date(),
        });
    },
    dayComplete: (userId, journeyId, dayNumber, metadata) => {
        journeyLogger.info('Day completed', {
            eventType: JourneyEventType.DAY_COMPLETE,
            userId,
            journeyId,
            dayNumber,
            metadata,
            timestamp: new Date(),
        });
    },
    reflectionSubmit: (userId, journeyId, dayNumber, reflectionLength, metadata) => {
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
    journeyComplete: (userId, journeyId, metadata) => {
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
