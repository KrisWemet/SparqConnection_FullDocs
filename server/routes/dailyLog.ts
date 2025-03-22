import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { validateAuthToken, AuthRequest } from '../middleware/auth';

const router = Router();

interface DailyLogEntry {
  action: string;
  reflection: string;
  mood: 1 | 2 | 3 | 4 | 5;
  date: string;
  userId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * @route POST /api/dailyLog
 * @desc Submit a daily log entry
 * @access Private
 */
router.post('/', validateAuthToken, async (req: AuthRequest, res: Response) => {
  try {
    const { action, reflection, mood, date } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    if (!action || !date || !mood) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (![1, 2, 3, 4, 5].includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood value' });
    }

    // Check if user has already logged today
    const today = new Date(date).toISOString().split('T')[0];
    const existingLog = await admin
      .firestore()
      .collection('users')
      .doc(user.id)
      .collection('dailyLog')
      .where('date', '==', today)
      .get();

    if (!existingLog.empty) {
      return res.status(400).json({ error: 'Already logged today' });
    }

    // Create new log entry
    const logEntry: Omit<DailyLogEntry, 'id'> = {
      action,
      reflection: reflection || '',
      mood,
      date: today,
      userId: user.id,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await admin
      .firestore()
      .collection('users')
      .doc(user.id)
      .collection('dailyLog')
      .add(logEntry);

    res.status(201).json({
      message: 'Daily log submitted successfully',
      logId: docRef.id,
    });
  } catch (error) {
    console.error('Error submitting daily log:', error);
    res.status(500).json({ error: 'Failed to submit daily log' });
  }
});

/**
 * @route GET /api/dailyLog/today
 * @desc Check if user has logged today
 * @access Private
 */
router.get('/today', validateAuthToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date().toISOString().split('T')[0];
    const logSnapshot = await admin
      .firestore()
      .collection('users')
      .doc(user.id)
      .collection('dailyLog')
      .where('date', '==', today)
      .get();

    if (logSnapshot.empty) {
      return res.json({ exists: false });
    }

    const log = logSnapshot.docs[0].data();
    res.json({
      exists: true,
      log: {
        id: logSnapshot.docs[0].id,
        ...log,
      },
    });
  } catch (error) {
    console.error('Error checking daily log:', error);
    res.status(500).json({ error: 'Failed to check daily log' });
  }
});

/**
 * @route GET /api/dailyLog/history
 * @desc Get user's log history
 * @access Private
 */
router.get('/history', validateAuthToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { limit = 30, startDate, endDate } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = admin
      .firestore()
      .collection('users')
      .doc(user.id)
      .collection('dailyLog')
      .orderBy('date', 'desc');

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }

    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const logSnapshot = await query.limit(Number(limit)).get();

    const logs = logSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching log history:', error);
    res.status(500).json({ error: 'Failed to fetch log history' });
  }
});

/**
 * @route GET /api/dailyLog/stats
 * @desc Get user's logging statistics
 * @access Private
 */
router.get('/stats', validateAuthToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const logSnapshot = await admin
      .firestore()
      .collection('users')
      .doc(user.id)
      .collection('dailyLog')
      .where('date', '>=', thirtyDaysAgoStr)
      .get();

    const logs = logSnapshot.docs.map(doc => doc.data());
    const totalLogs = logs.length;
    const averageMood = logs.reduce((sum, log) => sum + (log.mood || 0), 0) / totalLogs || 0;

    res.json({
      totalLogs,
      averageMood: Number(averageMood.toFixed(2)),
      streak: calculateStreak(logs),
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

function calculateStreak(logs: any[]): number {
  if (logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
  let currentDate = new Date(today);

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = logDate;
    } else {
      break;
    }
  }

  return streak;
}

export default router; 