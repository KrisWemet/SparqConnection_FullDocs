import express from 'express';
import passport from 'passport';
import { register, login, getProfile } from '../controllers/authController';
import { auth } from '../config/firebase';

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Test Firebase route
router.get('/test-firebase', async (req, res) => {
  try {
    // Try to list users (this will fail if Firebase is not properly configured)
    await auth.listUsers(1);
    res.json({ success: true, message: 'Firebase authentication is working' });
  } catch (error: any) {
    console.error('Firebase test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Firebase authentication is not working',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  getProfile
);

export default router; 