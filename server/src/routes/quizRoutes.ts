import express from 'express';
import passport from 'passport';
import { getQuizzes, getQuizById, submitQuizResponse } from '../controllers/quizController';

const router = express.Router();

// Protected routes
router.use(passport.authenticate('jwt', { session: false }));

// Get all quizzes
router.get('/', getQuizzes);

// Get quiz by ID
router.get('/:id', getQuizById);

// Submit quiz response
router.post('/response', submitQuizResponse);

export default router; 