import express, { Request, Response } from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';

const router = express.Router();

// Get user's journey progress
router.get('/:journeyId', validateAuthToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { journeyId } = req.params;

    const progressDoc = await db.collection('journeyProgress')
      .where('userId', '==', userId)
      .where('journeyId', '==', journeyId)
      .get();

    if (progressDoc.empty) {
      return res.json({
        completed: false,
        currentDay: 0,
        lastCompletedDate: null
      });
    }

    const progress = progressDoc.docs[0].data();
    res.json({
      id: progressDoc.docs[0].id,
      ...progress
    });
  } catch (error) {
    console.error('Error fetching journey progress:', error);
    res.status(500).json({ message: 'Error fetching journey progress' });
  }
});

// Update journey progress
router.post('/:journeyId', validateAuthToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { journeyId } = req.params;
    const { completed, currentDay, notes } = req.body;

    // Get existing progress
    const progressQuery = await db.collection('journeyProgress')
      .where('userId', '==', userId)
      .where('journeyId', '==', journeyId)
      .get();

    let progressRef;
    if (progressQuery.empty) {
      // Create new progress document
      progressRef = db.collection('journeyProgress').doc();
      await progressRef.set({
        userId,
        journeyId,
        completed: completed || false,
        currentDay: currentDay || 1,
        notes: notes || [],
        startDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Update existing progress
      progressRef = progressQuery.docs[0].ref;
      await progressRef.update({
        completed: completed ?? progressQuery.docs[0].data().completed,
        currentDay: currentDay ?? progressQuery.docs[0].data().currentDay,
        notes: notes ?? progressQuery.docs[0].data().notes,
        lastUpdated: new Date().toISOString()
      });
    }

    const updatedDoc = await progressRef.get();
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Error updating journey progress:', error);
    res.status(500).json({ message: 'Error updating journey progress' });
  }
});

export default router; 