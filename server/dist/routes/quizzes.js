import { Router } from 'express';
import { admin } from '../config/firebase';
const router = Router();
// Get all quizzes
router.get('/', async (_req, res) => {
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
        }));
        res.json({ quizzes });
    }
    catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get quiz by ID
router.get('/:id', async (req, res) => {
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
        };
        res.json({ quiz });
    }
    catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
