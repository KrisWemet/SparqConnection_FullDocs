import Gamification from '../models/Gamification';
import { getAllBadgeRequirements, checkForNewBadges } from '../services/badgeService';
import { emitGamificationUpdate } from '../services/socketService';
export const getGamificationStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        let stats = await Gamification.findOne({ user: userId });
        if (!stats) {
            stats = await Gamification.create({
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
};
export const getBadgeRequirements = async (_req, res) => {
    try {
        const requirements = getAllBadgeRequirements();
        res.json(requirements);
    }
    catch (error) {
        console.error('Error fetching badge requirements:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateGamificationStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { points = 0, quiz_completed = false, quiz_score = 0, daily_response = false, quiz_category, mood_tracked = false } = req.body;
        let stats = await Gamification.findOne({ user: userId });
        if (!stats) {
            stats = new Gamification({
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
        const newBadges = await checkForNewBadges(stats);
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
        await stats.save();
        // Emit real-time update
        emitGamificationUpdate(userId.toString(), {
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
};
export const resetStreak = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const stats = await Gamification.findOne({ user: userId });
        if (stats) {
            stats.current_streak = 0;
            await stats.save();
        }
        // Emit real-time update
        emitGamificationUpdate(userId.toString(), {
            current_streak: stats.current_streak,
            longest_streak: stats.longest_streak,
            streak_history: stats.streak_history
        });
        res.json({ message: 'Streak reset successfully' });
    }
    catch (error) {
        console.error('Error resetting streak:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updatePoints = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { points, source } = req.body;
        const stats = await Gamification.findOneAndUpdate({ user: userId }, {
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
        emitGamificationUpdate(userId.toString(), {
            points: stats.points,
            points_history: stats.points_history
        });
        res.json(stats);
    }
    catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateStreak = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const stats = await Gamification.findOne({ user: userId });
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
        await stats.save();
        // Emit real-time update
        emitGamificationUpdate(userId.toString(), {
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
};
