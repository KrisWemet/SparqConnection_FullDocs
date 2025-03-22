import express from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
const router = express.Router();
// Get all FAQs
router.get('/', async (req, res) => {
    try {
        const querySnapshot = await db.collection('faqs')
            .orderBy('createdAt', 'desc')
            .get();
        const faqs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(faqs);
    }
    catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Error fetching FAQs' });
    }
});
// Get FAQ by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = await db.collection('faqs').doc(id).get();
        if (!docRef.exists) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        res.json({
            id: docRef.id,
            ...docRef.data()
        });
    }
    catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({ message: 'Error fetching FAQ' });
    }
});
// Create new FAQ
router.post('/', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId || req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create FAQs' });
        }
        const { question, answer, category } = req.body;
        const faqData = {
            question,
            answer,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };
        const docRef = await db.collection('faqs').add(faqData);
        res.status(201).json({
            id: docRef.id,
            ...faqData
        });
    }
    catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Error creating FAQ' });
    }
});
// Delete FAQ
router.delete('/:id', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId || req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete FAQs' });
        }
        const { id } = req.params;
        const docRef = db.collection('faqs').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        await docRef.delete();
        res.json({ message: 'FAQ deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Error deleting FAQ' });
    }
});
export default router;
