import express from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
const router = express.Router();
// Get all journeys
router.get('/', async (req, res) => {
    try {
        const querySnapshot = await db.collection('journeys')
            .orderBy('createdAt', 'desc')
            .get();
        const journeys = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(journeys);
    }
    catch (error) {
        console.error('Error fetching journeys:', error);
        res.status(500).json({ message: 'Error fetching journeys' });
    }
});
// Get journey by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = await db.collection('journeys').doc(id).get();
        if (!docRef.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        const journey = {
            id: docRef.id,
            ...docRef.data()
        };
        res.json(journey);
    }
    catch (error) {
        console.error('Error fetching journey:', error);
        res.status(500).json({ message: 'Error fetching journey' });
    }
});
// Create new journey
router.post('/', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId || req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create journeys' });
        }
        const journeyData = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };
        const docRef = await db.collection('journeys').add(journeyData);
        const newJourney = {
            id: docRef.id,
            ...journeyData
        };
        res.status(201).json(newJourney);
    }
    catch (error) {
        console.error('Error creating journey:', error);
        res.status(500).json({ message: 'Error creating journey' });
    }
});
// Update journey
router.put('/:id', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId || req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update journeys' });
        }
        const { id } = req.params;
        const docRef = db.collection('journeys').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        const updatedJourney = {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };
        res.json(updatedJourney);
    }
    catch (error) {
        console.error('Error updating journey:', error);
        res.status(500).json({ message: 'Error updating journey' });
    }
});
// Delete journey
router.delete('/:id', validateAuthToken, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId || req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete journeys' });
        }
        const { id } = req.params;
        const docRef = db.collection('journeys').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        await docRef.delete();
        res.json({ message: 'Journey deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting journey:', error);
        res.status(500).json({ message: 'Error deleting journey' });
    }
});
export default router;
