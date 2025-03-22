import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getPersonalizedContent } from '../controllers/aiController';

const router = express.Router();

// Protected route for personalized content
router.post('/personalize', authenticateToken, getPersonalizedContent);

export default router; 