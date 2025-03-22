import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';

const router = Router();

interface Prompt {
  id: string;
  text: string;
  category: string;
  description: string;
  suggestedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  imageUrl?: string;
  responseCount: number;
  favoriteCount: number;
  isPublished: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Get all prompts
router.get('/', async (req: Request, res: Response) => {
  try {
    const snapshot = await admin.firestore()
      .collection('prompts')
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const prompts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Prompt[];

    res.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get prompt by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore()
      .collection('prompts')
      .doc(id)
      .get();

    if (!doc.exists || !doc.data()?.isPublished) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const prompt = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Prompt;

    res.json({ prompt });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /prompts/category/:category
 * @desc Get prompts by category
 * @access Public
 */
router.get('/category/:category', async (req: Request<{ category: string }>, res: Response) => {
  try {
    const { category } = req.params;

    const snapshot = await admin.firestore()
      .collection('prompts')
      .where('category', '==', category)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const prompts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Prompt[];

    res.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /prompts/popular
 * @desc Get popular prompts based on response count
 * @access Public
 */
router.get('/popular', async (_req: Request, res: Response) => {
  try {
    const snapshot = await admin.firestore()
      .collection('prompts')
      .where('isPublished', '==', true)
      .orderBy('responseCount', 'desc')
      .limit(5)
      .get();

    const prompts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Prompt[];

    res.json({ prompts });
  } catch (error) {
    console.error('Error fetching popular prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 