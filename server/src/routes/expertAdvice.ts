import express from 'express';
import { getExpertAdvice, getExpertAdviceById } from '../controllers/expertAdviceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all expert advice (with unlock status)
router.get('/', authenticateToken, getExpertAdvice);

// Get specific expert advice by ID
router.get('/:id', authenticateToken, getExpertAdviceById);

export default router; 