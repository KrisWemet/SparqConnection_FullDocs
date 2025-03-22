import express from 'express';
import passport from 'passport';
import { getAnalytics } from '../controllers/analyticsController';

const router = express.Router();

// Protected routes
router.use(passport.authenticate('jwt', { session: false }));

// Get user analytics
router.get('/', getAnalytics);

export default router; 