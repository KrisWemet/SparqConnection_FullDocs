import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';

const router = Router();

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  imageUrl?: string;
  completionCount: number;
  averageScore: number;
  isPublished: boolean;
  order: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Get all quizzes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const snapshot = await admin.firestore()
      .collection('quizzes')
      .where('isPublished', '==', true)
      .orderBy('order', 'asc')
      .get();

    const quizzes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Quiz[];

    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore()
      .collection('quizzes')
      .doc(id)
      .get();

    if (!doc.exists || !doc.data()?.isPublished) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Quiz;

    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 