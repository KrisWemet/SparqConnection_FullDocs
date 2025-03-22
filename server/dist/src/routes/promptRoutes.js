import express from 'express';
import passport from 'passport';
import { getTodayPrompt, submitPromptResponse } from '../controllers/promptController';
const router = express.Router();
// Protected routes
router.use(passport.authenticate('jwt', { session: false }));
// Get today's prompt
router.get('/today', getTodayPrompt);
// Submit prompt response
router.post('/response', submitPromptResponse);
export default router;
