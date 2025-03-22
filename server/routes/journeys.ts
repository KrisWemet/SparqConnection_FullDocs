import { Router } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';

const router = Router();

// Get all journeys
router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('journeys')
      .where('isPublished', '==', true)
      .orderBy('order', 'asc')
      .get();

    const journeys = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    res.json({ journeys });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get journey by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore()
      .collection('journeys')
      .doc(id)
      .get();

    if (!doc.exists || !doc.data()?.isPublished) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    const journey = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    };

    res.json({ journey });
  } catch (error) {
    console.error('Error fetching journey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /journeys/category/:category
 * @desc Get journeys by category
 * @access Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    // Get from Firestore
    const snapshot = await admin
      .firestore()
      .collection('journeys')
      .where('category', '==', category)
      .get();

    const journeys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Journey[];

    res.json({ journeys });
  } catch (error) {
    console.error('Error fetching journeys by category:', error);
    res.status(500).json({ error: 'Error fetching journeys' });
  }
});

/**
 * @route GET /journeys/popular
 * @desc Get popular journeys based on completion count
 * @access Public
 */
router.get('/popular', async (req, res) => {
  try {
    // Get from Firestore
    const snapshot = await admin
      .firestore()
      .collection('journeys')
      .orderBy('completionCount', 'desc')
      .limit(5)
      .get();

    const journeys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Journey[];

    res.json({ journeys });
  } catch (error) {
    console.error('Error fetching popular journeys:', error);
    res.status(500).json({ error: 'Error fetching popular journeys' });
  }
});

export default router; 