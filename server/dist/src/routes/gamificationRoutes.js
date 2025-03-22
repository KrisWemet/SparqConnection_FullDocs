import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getGamificationStatus, getBadgeRequirements, updateGamificationStats, resetStreak } from '../controllers/gamificationController';
const router = express.Router();
// Get user's gamification status
router.get('/status', authenticateToken, getGamificationStatus);
// Get all badge requirements
router.get('/badges', authenticateToken, getBadgeRequirements);
// Update gamification stats
router.post('/update', authenticateToken, updateGamificationStats);
// Reset streak (used by cron job when user misses a day)
router.post('/reset-streak', authenticateToken, resetStreak);
export default router;
