import { Router } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const router = Router();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Analytics event schema
const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  userId: z.string().optional(),
  timestamp: z.date().optional(),
  properties: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    screenResolution: z.string().optional(),
  }).optional(),
});

type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Track an analytics event
router.post('/track', validateAuthToken, analyticsLimiter, async (req, res) => {
  try {
    const event = AnalyticsEventSchema.parse({
      ...req.body,
      timestamp: new Date(),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'],
        screenResolution: req.headers['viewport-width'],
      },
    });

    await admin.firestore()
      .collection('analytics')
      .add(event);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    res.status(400).json({
      error: 'Invalid event data',
      details: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// Get analytics data (admin only)
router.get('/data', validateAuthToken, async (req, res) => {
  try {
    const { startDate, endDate, eventName } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify admin status
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    let analyticsRef = admin.firestore().collection('analytics');
    let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = analyticsRef;

    if (eventName) {
      queryRef = queryRef.where('eventName', '==', eventName);
    }

    if (startDate) {
      queryRef = queryRef.where('timestamp', '>=', new Date(startDate as string));
    }

    if (endDate) {
      queryRef = queryRef.where('timestamp', '<=', new Date(endDate as string));
    }

    const snapshot = await queryRef
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user-specific analytics
router.get('/user/:userId', validateAuthToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Users can only access their own analytics
    if (userId !== requestingUserId) {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(requestingUserId)
        .get();

      if (!userDoc.exists || !userDoc.data()?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
    }

    const snapshot = await admin.firestore()
      .collection('analytics')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get aggregated metrics
router.get('/metrics', validateAuthToken, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify admin status
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        return res.status(400).json({ error: 'Invalid timeframe' });
    }

    const snapshot = await admin.firestore()
      .collection('analytics')
      .where('timestamp', '>=', startDate)
      .get();

    const events = snapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const metrics = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.filter(e => e.userId).map(e => e.userId)).size,
      eventTypes: events.reduce((acc, event) => {
        acc[event.eventName] = (acc[event.eventName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.status(200).json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 