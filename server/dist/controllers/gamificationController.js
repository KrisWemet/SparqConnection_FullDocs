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
exports.updateStreak = exports.updatePoints = exports.resetStreak = exports.updateGamificationStats = exports.getBadgeRequirements = exports.getGamificationStatus = void 0;
const Gamification_1 = __importDefault(require("../models/Gamification"));
const badgeService_1 = require("../services/badgeService");
const socketService_1 = require("../services/socketService");
const getGamificationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        let stats = yield Gamification_1.default.findOne({ user: userId });
        if (!stats) {
            stats = yield Gamification_1.default.create({
                user: userId,
                points: 0,
                current_streak: 0,
                longest_streak: 0,
                total_quizzes_completed: 0,
                perfect_scores: 0,
                daily_responses: 0,
                badges: [],
                quiz_categories_completed: [],
                mood_entries: 0
            });
        }
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching gamification status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getGamificationStatus = getGamificationStatus;
const getBadgeRequirements = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirements = (0, badgeService_1.getAllBadgeRequirements)();
        res.json(requirements);
    }
    catch (error) {
        console.error('Error fetching badge requirements:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getBadgeRequirements = getBadgeRequirements;
const updateGamificationStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { points = 0, quiz_completed = false, quiz_score = 0, daily_response = false, quiz_category, mood_tracked = false } = req.body;
        let stats = yield Gamification_1.default.findOne({ user: userId });
        if (!stats) {
            stats = new Gamification_1.default({
                user: userId,
                points: 0,
                current_streak: 0,
                longest_streak: 0,
                total_quizzes_completed: 0,
                perfect_scores: 0,
                daily_responses: 0,
                badges: [],
                quiz_categories_completed: [],
                mood_entries: 0
            });
        }
        // Update points
        stats.points += points;
        // Update quiz stats
        if (quiz_completed) {
            stats.total_quizzes_completed += 1;
            if (quiz_score === 100) {
                stats.perfect_scores += 1;
            }
            if (quiz_category && !stats.quiz_categories_completed.includes(quiz_category)) {
                stats.quiz_categories_completed.push(quiz_category);
            }
        }
        // Update daily response stats
        if (daily_response) {
            stats.daily_responses += 1;
            stats.current_streak += 1;
            stats.longest_streak = Math.max(stats.longest_streak, stats.current_streak);
        }
        // Update mood tracking stats
        if (mood_tracked) {
            stats.mood_entries += 1;
        }
        // Check for new badges
        const newBadges = yield (0, badgeService_1.checkForNewBadges)(stats);
        if (newBadges.length > 0) {
            const badgesWithTimestamp = newBadges.map(badge => ({
                type: badge.type,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earned_at: new Date()
            }));
            stats.badges.push(...badgesWithTimestamp);
        }
        yield stats.save();
        // Emit real-time update
        (0, socketService_1.emitGamificationUpdate)(userId.toString(), {
            points: stats.points,
            current_streak: stats.current_streak,
            longest_streak: stats.longest_streak,
            total_quizzes_completed: stats.total_quizzes_completed,
            perfect_scores: stats.perfect_scores,
            daily_responses: stats.daily_responses,
            mood_entries: stats.mood_entries,
            quiz_categories_completed: stats.quiz_categories_completed,
            badges: stats.badges
        });
        res.json({
            stats,
            newBadges: newBadges.length > 0 ? newBadges : undefined
        });
    }
    catch (error) {
        console.error('Error updating gamification stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateGamificationStats = updateGamificationStats;
const resetStreak = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const stats = yield Gamification_1.default.findOne({ user: userId });
        if (stats) {
            stats.current_streak = 0;
            yield stats.save();
            // Emit real-time update
            (0, socketService_1.emitGamificationUpdate)(userId.toString(), {
                current_streak: stats.current_streak,
                longest_streak: stats.longest_streak,
                streak_history: stats.streak_history
            });
            res.json({ message: 'Streak reset successfully' });
        }
        else {
            res.status(404).json({ message: 'Gamification stats not found' });
        }
    }
    catch (error) {
        console.error('Error resetting streak:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.resetStreak = resetStreak;
const updatePoints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { points, source } = req.body;
        const stats = yield Gamification_1.default.findOneAndUpdate({ user: userId }, {
            $inc: { points },
            $push: {
                points_history: {
                    date: new Date(),
                    points,
                    source
                }
            }
        }, { new: true });
        if (!stats) {
            res.status(404).json({ message: 'Gamification stats not found' });
            return;
        }
        // Emit real-time update
        (0, socketService_1.emitGamificationUpdate)(userId.toString(), {
            points: stats.points,
            points_history: stats.points_history
        });
        res.json(stats);
    }
    catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updatePoints = updatePoints;
const updateStreak = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const stats = yield Gamification_1.default.findOne({ user: userId });
        if (!stats) {
            res.status(404).json({ message: 'Gamification stats not found' });
            return;
        }
        const { streak } = req.body;
        stats.current_streak = streak;
        stats.longest_streak = Math.max(stats.longest_streak, streak);
        stats.streak_history.push({
            date: new Date(),
            streak
        });
        yield stats.save();
        // Emit real-time update
        (0, socketService_1.emitGamificationUpdate)(userId.toString(), {
            current_streak: stats.current_streak,
            longest_streak: stats.longest_streak,
            streak_history: stats.streak_history
        });
        res.json(stats);
    }
    catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateStreak = updateStreak;
