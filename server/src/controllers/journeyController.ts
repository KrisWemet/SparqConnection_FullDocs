import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { logJourneyEvent } from '../utils/journeyLogger';
import { Timestamp } from 'firebase-admin/firestore';

// Define interfaces for journey data
interface Journey {
  id: string;
  title: string;
  description: string;
  duration: number;
  [key: string]: any;
}

interface JourneyProgress {
  currentDay: number;
  reflections: {
    [day: string]: {
      reflection: string;
      completed: boolean;
      timestamp: Timestamp | Date;
    };
  };
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
}

export const getJourneys = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('journeys').get();
    const journeys = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Journey[];

    res.json({
      success: true,
      data: journeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journeys',
    });
  }
};

export const getJourneyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    const userId = req.user.uid;

    const journeyDoc = await db.collection('journeys').doc(id).get();

    if (!journeyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const progressDoc = await db
      .collection('journeyProgress')
      .doc(`${userId}_${id}`)
      .get();

    const journeyData = journeyDoc.data() as Omit<Journey, 'id'>;
    const progressData = progressDoc.exists ? 
      progressDoc.data() as JourneyProgress : 
      { currentDay: 1, reflections: {} };

    const journey = {
      id: journeyDoc.id,
      ...journeyData,
      progress: progressData,
    };

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journey',
    });
  }
};

export const startJourney = async (req: Request, res: Response) => {
  try {
    const { journeyId } = req.body;
    
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    const userId = req.user.uid;

    // Check if journey exists
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    if (!journeyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const journeyData = journeyDoc.data() as Journey;

    // Initialize journey progress
    await db
      .collection('journeyProgress')
      .doc(`${userId}_${journeyId}`)
      .set({
        currentDay: 1,
        reflections: {},
        startedAt: new Date(),
      });

    // Log journey start event
    logJourneyEvent.start(userId, journeyId, {
      journeyTitle: journeyData?.title,
    });

    res.json({
      success: true,
      message: 'Journey started successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting journey',
    });
  }
};

export const updateJourneyProgress = async (req: Request, res: Response) => {
  try {
    const { journeyId, day, reflection } = req.body;
    
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    const userId = req.user.uid;

    // Validate input
    if (!day || day < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day number',
      });
    }

    if (!reflection || reflection.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reflection is required',
      });
    }

    const progressRef = db.collection('journeyProgress').doc(`${userId}_${journeyId}`);
    const progressDoc = await progressRef.get();

    if (!progressDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Journey progress not found',
      });
    }

    const currentProgress = progressDoc.data() as JourneyProgress;
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    const journeyData = journeyDoc.data() as Journey;
    const isLastDay = day === journeyData?.duration;

    // Update progress
    await progressRef.update({
      currentDay: day + 1,
      [`reflections.${day}`]: {
        reflection,
        completed: true,
        timestamp: new Date(),
      },
      ...(isLastDay && { completedAt: new Date() }),
    });

    // Log reflection submission
    logJourneyEvent.reflectionSubmit(userId, journeyId, day, reflection.length, {
      journeyTitle: journeyData?.title,
    });

    // Log day completion
    logJourneyEvent.dayComplete(userId, journeyId, day, {
      journeyTitle: journeyData?.title,
    });

    // If this was the last day, log journey completion
    if (isLastDay) {
      logJourneyEvent.journeyComplete(userId, journeyId, {
        journeyTitle: journeyData?.title,
        totalDays: journeyData?.duration,
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
    });
  }
};

interface JourneyProgressSummary {
  journeyId: string;
  title: string;
  description: string;
  totalDays: number;
  completedDays: number;
  currentDay: number;
  startedAt: Timestamp | Date | null;
  lastActivity: Date | null;
  isComplete: boolean;
}

export const getUserJourneyProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    const userId = req.user.uid;

    // Get all journeys
    const journeysSnapshot = await db.collection('journeys').get();
    const journeys = journeysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Journey[];

    // Get user's progress for all journeys
    const progressPromises = journeys.map(async journey => {
      const progressDoc = await db
        .collection('journeyProgress')
        .doc(`${userId}_${journey.id}`)
        .get();

      const progress = progressDoc.exists ? progressDoc.data() as JourneyProgress : null;

      const completedDays = progress ? 
        Object.keys(progress.reflections || {}).length : 
        0;

      let lastActivity: Date | null = null;
      if (progress && progress.reflections && Object.keys(progress.reflections).length > 0) {
        const timestamps = Object.values(progress.reflections)
          .map(r => {
            const timestamp = r.timestamp;
            return timestamp instanceof Date ? timestamp : timestamp?.toDate();
          })
          .filter(Boolean) as Date[];

        if (timestamps.length > 0) {
          lastActivity = new Date(Math.max(...timestamps.map(d => d.getTime())));
        }
      }

      const result: JourneyProgressSummary = {
        journeyId: journey.id,
        title: journey.title,
        description: journey.description,
        totalDays: journey.duration,
        completedDays,
        currentDay: progress ? progress.currentDay : 1,
        startedAt: progress?.startedAt || null,
        lastActivity,
        isComplete: progress?.completedAt ? true : false,
      };

      return result;
    });

    const userProgress = await Promise.all(progressPromises);

    // Sort by last activity (most recent first) and started journeys first
    const sortedProgress = userProgress.sort((a, b) => {
      // Started journeys come before not started
      if (a.startedAt && !b.startedAt) return -1;
      if (!a.startedAt && b.startedAt) return 1;
      
      // Sort by last activity
      const aTime = a.lastActivity?.getTime() || 
                   (a.startedAt instanceof Date ? a.startedAt.getTime() : 
                    a.startedAt?.toDate().getTime()) || 0;
      
      const bTime = b.lastActivity?.getTime() || 
                   (b.startedAt instanceof Date ? b.startedAt.getTime() : 
                    b.startedAt?.toDate().getTime()) || 0;
      
      return bTime - aTime;
    });

    res.json({
      success: true,
      data: sortedProgress,
    });
  } catch (error) {
    console.error('Error fetching user journey progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journey progress',
    });
  }
}; 