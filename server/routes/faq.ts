import { Router } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const router = Router();

// Rate limiting for FAQ endpoints
const faqLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// FAQ schema
const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  order: z.number(),
  isPublished: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type FAQ = z.infer<typeof FAQSchema>;

// Get all FAQs
router.get('/', faqLimiter, async (req, res) => {
  try {
    const { category } = req.query;

    let query = admin.firestore()
      .collection('faqs')
      .where('isPublished', '==', true)
      .orderBy('order', 'asc');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const faqs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    res.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get FAQ by ID
router.get('/:id', faqLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore()
      .collection('faqs')
      .doc(id)
      .get();

    if (!doc.exists || !doc.data()?.isPublished) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    const faq = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    };

    res.json({ faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update FAQ (admin only)
router.post('/', validateAuthToken, async (req, res) => {
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

    const faqData = FAQSchema.parse({
      ...req.body,
      updatedAt: new Date(),
      createdAt: req.body.id ? undefined : new Date(),
    });

    if (faqData.id) {
      // Update existing FAQ
      await admin.firestore()
        .collection('faqs')
        .doc(faqData.id)
        .update(faqData);
    } else {
      // Create new FAQ
      const docRef = await admin.firestore()
        .collection('faqs')
        .add(faqData);
      faqData.id = docRef.id;
    }

    res.json({ faq: faqData });
  } catch (error) {
    console.error('Error saving FAQ:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid FAQ data',
        details: error.errors,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', validateAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify admin status
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const faqDoc = await admin.firestore()
      .collection('faqs')
      .doc(id)
      .get();

    if (!faqDoc.exists) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    await admin.firestore()
      .collection('faqs')
      .doc(id)
      .delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 