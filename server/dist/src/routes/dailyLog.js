import express from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
const router = express.Router();
// Create a new daily log entry
router.post('/', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { mood, activities, notes, date } = req.body;
        const logEntry = {
            userId,
            mood,
            activities,
            notes,
            date: date || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('dailyLogs').add(logEntry);
        res.status(201).json({
            id: docRef.id,
            ...logEntry
        });
    }
    catch (error) {
        console.error('Error creating daily log:', error);
        res.status(500).json({ message: 'Error creating daily log entry' });
    }
});
// Get today's log entry
router.get('/today', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const querySnapshot = await db.collection('dailyLogs')
            .where('userId', '==', userId)
            .where('date', '>=', today.toISOString())
            .where('date', '<', tomorrow.toISOString())
            .get();
        if (querySnapshot.empty) {
            return res.json(null);
        }
        const doc = querySnapshot.docs[0];
        res.json({
            id: doc.id,
            ...doc.data()
        });
    }
    catch (error) {
        console.error('Error fetching today\'s log:', error);
        res.status(500).json({ message: 'Error fetching daily log' });
    }
});
// Get log history
router.get('/history', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { startDate, endDate } = req.query;
        let query = db.collection('dailyLogs').where('userId', '==', userId);
        if (startDate) {
            query = query.where('date', '>=', startDate);
        }
        if (endDate) {
            query = query.where('date', '<=', endDate);
        }
        const querySnapshot = await query.orderBy('date', 'desc').get();
        const logs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching log history:', error);
        res.status(500).json({ message: 'Error fetching log history' });
    }
});
// Get user stats
router.get('/stats', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const querySnapshot = await db.collection('dailyLogs')
            .where('userId', '==', userId)
            .get();
        const logs = querySnapshot.docs.map(doc => doc.data());
        const stats = {
            totalEntries: logs.length,
            moodDistribution: calculateMoodDistribution(logs),
            commonActivities: calculateCommonActivities(logs),
            streakData: calculateStreakData(logs)
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});
// Helper functions
function calculateMoodDistribution(logs) {
    return logs.reduce((acc, log) => {
        acc[log.mood] = (acc[log.mood] || 0) + 1;
        return acc;
    }, {});
}
function calculateCommonActivities(logs) {
    const activities = logs.flatMap(log => log.activities || []);
    return activities.reduce((acc, activity) => {
        acc[activity] = (acc[activity] || 0) + 1;
        return acc;
    }, {});
}
function calculateStreakData(logs) {
    // Sort logs by date
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;
    for (const log of sortedLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (!lastDate) {
            currentStreak = 1;
        }
        else {
            const dayDiff = Math.floor((lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                currentStreak++;
            }
            else {
                currentStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, currentStreak);
        lastDate = logDate;
    }
    return {
        currentStreak,
        longestStreak
    };
}
export default router;
