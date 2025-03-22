import { Router } from 'express';
import { startJourney, updateJourneyProgress } from '../controllers/journeyController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Start a new journey
router.post('/start', authenticate, startJourney);

// Update journey progress
router.post('/update', authenticate, updateJourneyProgress);

export default router; 