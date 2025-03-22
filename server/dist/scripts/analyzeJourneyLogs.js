"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJourneyLogs = analyzeJourneyLogs;
exports.generateReport = generateReport;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const journeyLogger_1 = require("../utils/journeyLogger");
function analyzeJourneyLogs() {
    return __awaiter(this, arguments, void 0, function* (daysBack = 30) {
        var _a, e_1, _b, _c;
        var _d;
        const stats = {
            totalJourneysStarted: 0,
            totalJourneysCompleted: 0,
            totalDaysCompleted: 0,
            totalReflectionsSubmitted: 0,
            averageReflectionLength: 0,
            completionRate: 0,
            userStats: {},
            journeyStats: {},
            timeOfDayStats: {},
        };
        const logDir = path_1.default.join(process.cwd(), 'logs');
        const currentDate = new Date();
        const oldestDate = new Date();
        oldestDate.setDate(currentDate.getDate() - daysBack);
        try {
            const files = yield fs_1.default.promises.readdir(logDir);
            const journeyLogFiles = files.filter(file => file.startsWith('journey-') &&
                file.endsWith('.log') &&
                new Date(file.slice(8, 18)) >= oldestDate);
            let totalReflectionLength = 0;
            for (const file of journeyLogFiles) {
                const fileStream = fs_1.default.createReadStream(path_1.default.join(logDir, file));
                const rl = readline_1.default.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });
                try {
                    for (var _e = true, rl_1 = (e_1 = void 0, __asyncValues(rl)), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _e = true) {
                        _c = rl_1_1.value;
                        _e = false;
                        const line = _c;
                        try {
                            const logEntry = JSON.parse(line);
                            const timestamp = new Date(logEntry.timestamp);
                            const hour = timestamp.getHours().toString().padStart(2, '0');
                            // Initialize user stats if not exists
                            if (!stats.userStats[logEntry.userId]) {
                                stats.userStats[logEntry.userId] = {
                                    journeysStarted: 0,
                                    journeysCompleted: 0,
                                    daysCompleted: 0,
                                    reflectionsSubmitted: 0,
                                    totalReflectionLength: 0,
                                    averageReflectionLength: 0,
                                    lastActivity: timestamp,
                                };
                            }
                            // Initialize journey stats if not exists
                            if (!stats.journeyStats[logEntry.journeyId]) {
                                stats.journeyStats[logEntry.journeyId] = {
                                    starts: 0,
                                    completions: 0,
                                    daysCompleted: 0,
                                    reflections: 0,
                                    title: (_d = logEntry.metadata) === null || _d === void 0 ? void 0 : _d.journeyTitle,
                                };
                            }
                            // Update time of day stats
                            stats.timeOfDayStats[hour] = (stats.timeOfDayStats[hour] || 0) + 1;
                            // Update stats based on event type
                            switch (logEntry.eventType) {
                                case journeyLogger_1.JourneyEventType.START:
                                    stats.totalJourneysStarted++;
                                    stats.userStats[logEntry.userId].journeysStarted++;
                                    stats.journeyStats[logEntry.journeyId].starts++;
                                    break;
                                case journeyLogger_1.JourneyEventType.DAY_COMPLETE:
                                    stats.totalDaysCompleted++;
                                    stats.userStats[logEntry.userId].daysCompleted++;
                                    stats.journeyStats[logEntry.journeyId].daysCompleted++;
                                    break;
                                case journeyLogger_1.JourneyEventType.REFLECTION_SUBMIT:
                                    stats.totalReflectionsSubmitted++;
                                    stats.userStats[logEntry.userId].reflectionsSubmitted++;
                                    stats.journeyStats[logEntry.journeyId].reflections++;
                                    totalReflectionLength += logEntry.reflectionLength || 0;
                                    stats.userStats[logEntry.userId].totalReflectionLength += logEntry.reflectionLength || 0;
                                    break;
                                case journeyLogger_1.JourneyEventType.JOURNEY_COMPLETE:
                                    stats.totalJourneysCompleted++;
                                    stats.userStats[logEntry.userId].journeysCompleted++;
                                    stats.journeyStats[logEntry.journeyId].completions++;
                                    break;
                            }
                            // Update last activity
                            if (timestamp > stats.userStats[logEntry.userId].lastActivity) {
                                stats.userStats[logEntry.userId].lastActivity = timestamp;
                            }
                        }
                        catch (error) {
                            console.error('Error processing log line:', error);
                            continue;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_e && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            // Calculate averages and rates
            stats.averageReflectionLength = totalReflectionLength / stats.totalReflectionsSubmitted || 0;
            stats.completionRate = (stats.totalJourneysCompleted / stats.totalJourneysStarted) * 100 || 0;
            // Calculate user averages
            Object.values(stats.userStats).forEach(userStat => {
                userStat.averageReflectionLength =
                    userStat.totalReflectionLength / userStat.reflectionsSubmitted || 0;
            });
            return stats;
        }
        catch (error) {
            console.error('Error analyzing journey logs:', error);
            throw error;
        }
    });
}
// Function to generate a formatted report
function generateReport(stats) {
    return `
Journey Analytics Report
=======================

Overall Statistics
----------------
Total Journeys Started: ${stats.totalJourneysStarted}
Total Journeys Completed: ${stats.totalJourneysCompleted}
Completion Rate: ${stats.completionRate.toFixed(2)}%
Total Days Completed: ${stats.totalDaysCompleted}
Total Reflections: ${stats.totalReflectionsSubmitted}
Average Reflection Length: ${stats.averageReflectionLength.toFixed(2)} characters

User Engagement
-------------
Total Active Users: ${Object.keys(stats.userStats).length}
Most Active Users (by days completed):
${Object.entries(stats.userStats)
        .sort((a, b) => b[1].daysCompleted - a[1].daysCompleted)
        .slice(0, 5)
        .map(([userId, stats]) => `- User ${userId}: ${stats.daysCompleted} days, ${stats.journeysCompleted} journeys completed`).join('\n')}

Journey Performance
----------------
${Object.entries(stats.journeyStats)
        .map(([journeyId, stats]) => `${stats.title || journeyId}:
    - Started: ${stats.starts}
    - Completed: ${stats.completions}
    - Completion Rate: ${((stats.completions / stats.starts) * 100).toFixed(2)}%
    - Total Days Completed: ${stats.daysCompleted}
    - Total Reflections: ${stats.reflections}`).join('\n\n')}

Time of Day Analysis
-----------------
Peak Activity Hours:
${Object.entries(stats.timeOfDayStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => `- ${hour}:00: ${count} events`).join('\n')}
`;
}
// If running directly (not imported)
if (require.main === module) {
    const daysBack = process.argv[2] ? parseInt(process.argv[2]) : 30;
    analyzeJourneyLogs(daysBack)
        .then(stats => {
        console.log(generateReport(stats));
    })
        .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
