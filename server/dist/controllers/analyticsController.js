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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const Gamification_1 = __importDefault(require("../models/Gamification"));
const QuizResponse_1 = __importDefault(require("../models/QuizResponse"));
const mongoose_1 = __importDefault(require("mongoose"));
const PromptResponse_1 = __importDefault(require("../models/PromptResponse"));
const getAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Get gamification data
        const gamificationData = yield Gamification_1.default.findOne({ user_id: userId });
        // Get quiz scores
        const quizResponses = yield QuizResponse_1.default.find({ user_id: userId })
            .sort({ completed_at: -1 })
            .limit(10);
        // Calculate quiz score averages by category
        const quizScores = quizResponses.reduce((acc, response) => {
            if (!acc.communication)
                acc.communication = [];
            if (!acc.empathy)
                acc.empathy = [];
            if (!acc.conflict_resolution)
                acc.conflict_resolution = [];
            // Simulated categorization - in production, this would come from the quiz data
            const category = response.quiz_id.includes('comm') ? 'communication' :
                response.quiz_id.includes('emp') ? 'empathy' : 'conflict_resolution';
            acc[category].push(response.total_score);
            return acc;
        }, {});
        // Calculate averages
        const calculateAverage = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
        // Get points history for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const pointsHistory = (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.points_history.filter(ph => ph.date >= thirtyDaysAgo).sort((a, b) => a.date.getTime() - b.date.getTime())) || [];
        // Aggregate daily points
        const dailyPoints = pointsHistory.reduce((acc, entry) => {
            const date = entry.date.toISOString().split('T')[0];
            const existingDay = acc.find(day => day.date === date);
            if (existingDay) {
                existingDay.points += entry.points;
            }
            else {
                acc.push({ date, points: entry.points });
            }
            return acc;
        }, []);
        // Get streak history
        const streakHistory = (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.streak_history.filter(sh => sh.date >= thirtyDaysAgo).sort((a, b) => a.date.getTime() - b.date.getTime())) || [];
        // Get prompt response time distribution
        const responseTimeDistribution = yield PromptResponse_1.default.aggregate([
            { $match: { user: new mongoose_1.default.Types.ObjectId(userId.toString()) } },
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: '$created_at' },
                    hour: { $hour: '$created_at' }
                }
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: '$dayOfWeek',
                        hour: '$hour'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    dayOfWeek: '$_id.dayOfWeek',
                    hour: '$_id.hour',
                    count: 1
                }
            },
            { $sort: { dayOfWeek: 1, hour: 1 } }
        ]);
        // Get badge distribution
        const gamificationStats = yield Gamification_1.default.findOne({ user: userId });
        const badges = (gamificationStats === null || gamificationStats === void 0 ? void 0 : gamificationStats.badges) || [];
        const badgeCounts = badges.reduce((acc, badge) => {
            acc[badge.type] = (acc[badge.type] || 0) + 1;
            return acc;
        }, {});
        const totalBadges = badges.length;
        const badgeDistribution = Object.entries(badgeCounts).map(([type, count]) => ({
            type,
            count,
            percentage: (count / totalBadges) * 100
        }));
        // Get overall engagement metrics
        const totalResponses = yield PromptResponse_1.default.countDocuments({ user: userId });
        const averageResponsesPerDay = yield PromptResponse_1.default.aggregate([
            { $match: { user: new mongoose_1.default.Types.ObjectId(userId.toString()) } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgResponses: { $avg: '$count' }
                }
            }
        ]);
        // Format response data
        const responseHeatmap = Array(7).fill(null).map(() => Array(24).fill(0));
        responseTimeDistribution.forEach(({ dayOfWeek, hour, count }) => {
            responseHeatmap[dayOfWeek - 1][hour] = count;
        });
        const analytics = {
            points: {
                total: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.points) || 0,
                history: dailyPoints
            },
            streaks: {
                current: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.current_streak) || 0,
                longest: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.longest_streak) || 0,
                history: streakHistory
            },
            badges: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.badges) || [],
            quiz_scores: {
                communication: calculateAverage(quizScores.communication || []),
                empathy: calculateAverage(quizScores.empathy || []),
                conflict_resolution: calculateAverage(quizScores.conflict_resolution || [])
            },
            total_responses: quizResponses.length,
            response_streak: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.current_streak) || 0,
            mood_trends: {
                average: 4.2, // This would come from actual mood data
                weekly_trend: [4, 3, 5, 4, 4, 5, 4], // This would be calculated from actual data
                improvement_areas: ['communication', 'active_listening'] // This would be derived from actual data
            },
            responseHeatmap,
            badgeDistribution,
            engagementMetrics: {
                totalResponses,
                averageResponsesPerDay: ((_b = averageResponsesPerDay[0]) === null || _b === void 0 ? void 0 : _b.avgResponses) || 0,
                totalBadges,
                badgeCompletionRate: (totalBadges / ((gamificationStats === null || gamificationStats === void 0 ? void 0 : gamificationStats.badges.length) || 1)) * 100
            }
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAnalytics = getAnalytics;
