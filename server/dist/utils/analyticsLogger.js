import { createLogger, format, transports } from 'winston';
import path from 'path';
// Define log event types
export var AnalyticsEventType;
(function (AnalyticsEventType) {
    AnalyticsEventType["JOURNEY_START"] = "JOURNEY_START";
    AnalyticsEventType["DAY_COMPLETE"] = "DAY_COMPLETE";
    AnalyticsEventType["ACTIVITY_COMPLETE"] = "ACTIVITY_COMPLETE";
    AnalyticsEventType["SKIPPED_ACTIVITY"] = "SKIPPED_ACTIVITY";
})(AnalyticsEventType || (AnalyticsEventType = {}));
// Configure Winston logger
const logDir = path.join(process.cwd(), 'logs', 'analytics');
const analyticsLogger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json(), format.errors({ stack: true }), format.metadata()),
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
                    format: format.combine(format.colorize(), format.simple()),
                })]
            : []),
    ],
});
// Helper functions for logging different event types
export const logJourneyStart = (userId, journeyId, journeyTitle, metadata) => {
    const event = {
        eventType: AnalyticsEventType.JOURNEY_START,
        userId,
        journeyId,
        journeyTitle,
        timestamp: new Date().toISOString(),
        metadata,
    };
    analyticsLogger.info('Journey started', event);
};
export const logDayComplete = (userId, journeyId, journeyTitle, dayNumber, metadata) => {
    const event = {
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
export const logActivityComplete = (userId, journeyId, activityId, activityTitle, dayNumber, duration, completionStatus = 'success', metadata) => {
    const event = {
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
export const logSkippedActivity = (userId, journeyId, activityId, activityTitle, dayNumber, metadata) => {
    const event = {
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
export const logAnalyticsError = (error, context) => {
    analyticsLogger.error('Analytics error', {
        error: error.message,
        stack: error.stack,
        ...context,
    });
};
// Export logger instance for direct use if needed
export default analyticsLogger;
