import express from 'express';
import passport from 'passport';
import { register, login, getProfile } from '../controllers/authController';
const router = express.Router();
// Register new user
router.post('/register', register);
// Login user
router.post('/login', login);
// Get user profile (protected route)
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);
export default router;
