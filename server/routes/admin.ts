import { Router } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.use(validateAuthToken);

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Verify admin status
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Get stats from Firestore
    const [users, journeys, quizzes, prompts] = await Promise.all([
      admin.firestore().collection('users').count().get(),
      admin.firestore().collection('journeys').count().get(),
      admin.firestore().collection('quizzes').count().get(),
      admin.firestore().collection('prompts').count().get()
    ]);

    const stats = {
      totalUsers: users.data().count,
      totalJourneys: journeys.data().count,
      totalQuizzes: quizzes.data().count,
      totalPrompts: prompts.data().count
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 