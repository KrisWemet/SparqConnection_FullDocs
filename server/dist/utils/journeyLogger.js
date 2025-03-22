"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logJourneyEvent = exports.JourneyEventType = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
// Define log event types
var JourneyEventType;
(function (JourneyEventType) {
    JourneyEventType["START"] = "JOURNEY_START";
    JourneyEventType["DAY_COMPLETE"] = "DAY_COMPLETE";
    JourneyEventType["REFLECTION_SUBMIT"] = "REFLECTION_SUBMIT";
    JourneyEventType["JOURNEY_COMPLETE"] = "JOURNEY_COMPLETE";
})(JourneyEventType || (exports.JourneyEventType = JourneyEventType = {}));
// Create the journey logger
const journeyLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: 'journey-service' },
    transports: [
        // Journey-specific rotating file transport
        new winston_1.default.transports.DailyRotateFile({
            filename: path_1.default.join('logs', 'journey-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
        }),
        // Console transport for development
        ...(process.env.NODE_ENV !== 'production'
            ? [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ]
            : []),
    ],
});
// Helper functions for logging different journey events
exports.logJourneyEvent = {
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
exports.default = journeyLogger;
