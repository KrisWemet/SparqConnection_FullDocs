import { Request, Response } from 'express';
import { db } from '../config/firebase';
import {
  logJourneyStart,
  logDayComplete,
  logActivityComplete,
  logSkippedActivity,
  logAnalyticsError,
} from '../utils/analyticsLogger';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Journey interface
interface Journey {
  id: string;
  title: string;
  category: string;
  duration: number;
  days: Array<{
    title: string;
    content: string;
    activities: string[];
  }>;
}

// Progress interface
interface JourneyProgress {
  currentDay: number;
  startTime?: number;
  partnerId?: string;
  reflections: Record<string, any>;
}

export const startJourney = async (req: AuthRequest, res: Response) => {
  try {
    const { journeyId } = req.body;
    const userId = req.user?.id;

    if (!journeyId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get journey details
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();

    if (!journeyDoc.exists) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    const journey = journeyDoc.data() as Journey;

    // Create journey progress document
    await db.collection('users').doc(userId).collection('journeyProgress').doc(journeyId).set({
      currentDay: 1,
      startedAt: new Date(),
      lastActivity: new Date(),
      reflections: {},
    });

    // Log journey start
    logJourneyStart(userId, journeyId, journey.title, {
      startedAt: new Date(),
      category: journey.category,
      duration: journey.duration,
    });

    return res.json({
      success: true,
      message: 'Journey started successfully',
    });
  } catch (error) {
    logAnalyticsError(error as Error, {
      operation: 'startJourney',
      userId: req.user?.id,
      journeyId: req.body.journeyId,
    });
    return res.status(500).json({ error: 'Failed to start journey' });
  }
};

export const updateJourneyProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { journeyId, currentDay, reflection, iv } = req.body;
    const userId = req.user?.id;

    if (!journeyId || !userId || !currentDay || !reflection || !iv) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get journey details
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    const journey = journeyDoc.data() as Journey;

    // Get user's progress
    const progressRef = db.collection('users').doc(userId).collection('journeyProgress').doc(journeyId);
    const progressDoc = await progressRef.get();
    const progress = progressDoc.data() as JourneyProgress;

    // Start a batch write
    const batch = db.batch();

    // Update user's progress
    batch.update(progressRef, {
      currentDay,
      lastActivity: new Date(),
      [`reflections.${currentDay}`]: {
        reflection,
        iv,
        completed: true,
        timestamp: new Date(),
      },
    });

    // If user has a partner, update partner's sync status
    if (progress?.partnerId) {
      const partnerRef = db.collection('users').doc(progress.partnerId).collection('journeyProgress').doc(journeyId);
      batch.update(partnerRef, {
        partnerSyncStatus: 'pending',
        lastPartnerActivity: new Date(),
      });
    }

    await batch.commit();

    // Log day completion
    logDayComplete(userId, journeyId, journey.title, currentDay, {
      completionTime: progress?.startTime ? (Date.now() - progress.startTime) / 1000 : undefined,
      reflectionLength: reflection.length,
      hasPartner: !!progress?.partnerId,
    });

    // If this was the last day, log journey completion
    if (currentDay === journey.duration) {
      logJourneyStart(userId, journeyId, journey.title, {
        completedAt: new Date(),
        totalDays: journey.duration,
        hasPartner: !!progress?.partnerId,
      });
    }

    return res.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    logAnalyticsError(error as Error, {
      operation: 'updateJourneyProgress',
      userId: req.user?.id,
      journeyId: req.body.journeyId,
      currentDay: req.body.currentDay,
    });
    return res.status(500).json({ error: 'Failed to update progress' });
  }
};

// Activity interfaces
interface Activity {
  title: string;
  category: string;
  difficulty: string;
}

export const completeActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { journeyId, activityId, dayNumber, duration, status = 'success' } = req.body;
    const userId = req.user?.id;

    if (!journeyId || !userId || !activityId || !dayNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get activity details
    const activityDoc = await db.collection('journeys')
      .doc(journeyId)
      .collection('days')
      .doc(String(dayNumber))
      .collection('activities')
      .doc(activityId)
      .get();

    if (!activityDoc.exists) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = activityDoc.data() as Activity;

    // Update activity progress
    await db.collection('users')
      .doc(userId)
      .collection('activityProgress')
      .doc(`${journeyId}_${activityId}`)
      .set({
        completed: true,
        completedAt: new Date(),
        duration,
        status,
      });

    // Log activity completion
    logActivityComplete(
      userId,
      journeyId,
      activityId,
      activity.title,
      dayNumber,
      duration,
      status as 'success' | 'partial' | 'failed',
      {
        category: activity.category,
        difficulty: activity.difficulty,
      }
    );

    return res.json({
      success: true,
      message: 'Activity completed successfully',
    });
  } catch (error) {
    logAnalyticsError(error as Error, {
      operation: 'completeActivity',
      userId: req.user?.id,
      journeyId: req.body.journeyId,
      activityId: req.body.activityId,
      dayNumber: req.body.dayNumber,
    });
    return res.status(500).json({ error: 'Failed to complete activity' });
  }
};

export const skipActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { journeyId, activityId, dayNumber, reason } = req.body;
    const userId = req.user?.id;

    if (!journeyId || !userId || !activityId || !dayNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get activity details
    const activityDoc = await db.collection('journeys')
      .doc(journeyId)
      .collection('days')
      .doc(String(dayNumber))
      .collection('activities')
      .doc(activityId)
      .get();

    if (!activityDoc.exists) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = activityDoc.data() as Activity;

    // Update activity progress
    await db.collection('users')
      .doc(userId)
      .collection('activityProgress')
      .doc(`${journeyId}_${activityId}`)
      .set({
        skipped: true,
        skippedAt: new Date(),
        reason,
      });

    // Log skipped activity
    logSkippedActivity(
      userId,
      journeyId,
      activityId,
      activity.title,
      dayNumber,
      {
        reason,
        category: activity.category,
        difficulty: activity.difficulty,
      }
    );

    return res.json({
      success: true,
      message: 'Activity skipped successfully',
    });
  } catch (error) {
    logAnalyticsError(error as Error, {
      operation: 'skipActivity',
      userId: req.user?.id,
      journeyId: req.body.journeyId,
      activityId: req.body.activityId,
      dayNumber: req.body.dayNumber,
    });
    return res.status(500).json({ error: 'Failed to skip activity' });
  }
}; 