import express from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
const router = express.Router();
// Get user analytics data
router.get('/user/:userId', validateAuthToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user?.uid;
        if (!requestingUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Only allow users to access their own data or admins to access any data
        if (requestingUserId !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const analyticsData = {
            userId: userDoc.id,
            ...userData?.analytics || {}
        };
        res.json(analyticsData);
    }
    catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
});
// Get engagement metrics
router.get('/metrics', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const metrics = {
            totalLogins: userData?.metrics?.totalLogins || 0,
            lastLogin: userData?.metrics?.lastLogin || null,
            sessionDuration: userData?.metrics?.sessionDuration || 0,
            completedJourneys: userData?.metrics?.completedJourneys || 0,
            promptResponses: userData?.metrics?.promptResponses || 0
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
});
export default router;
