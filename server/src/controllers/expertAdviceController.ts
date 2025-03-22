import { Request, Response } from 'express';
import { expertAdviceService } from '../services/firestoreService';
import Gamification from '../models/Gamification';

export const getExpertAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user's points from gamification data
    const gamificationData = await Gamification.findOne({ user: userId });
    const userPoints = gamificationData?.points || 0;

    // Fetch all expert advice from Firestore
    const expertAdvice = await expertAdviceService.getAllExpertAdvice();

    // Mark tips as locked/unlocked based on user's points
    const processedAdvice = expertAdvice.map(tip => ({
      ...tip,
      is_unlocked: userPoints >= tip.points_required,
      points_needed: Math.max(0, tip.points_required - userPoints)
    }));

    // Group tips by category
    const groupedAdvice = processedAdvice.reduce((acc: { [key: string]: any[] }, tip) => {
      if (!acc[tip.category]) {
        acc[tip.category] = [];
      }
      acc[tip.category].push(tip);
      return acc;
    }, {});

    res.json({
      user_points: userPoints,
      tips_by_category: groupedAdvice
    });
  } catch (error) {
    console.error('Error fetching expert advice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExpertAdviceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Get user's points
    const gamificationData = await Gamification.findOne({ user: userId });
    const userPoints = gamificationData?.points || 0;

    // Fetch specific tip from Firestore
    const tip = await expertAdviceService.getExpertAdviceById(id);

    if (!tip) {
      res.status(404).json({ message: 'Expert advice not found' });
      return;
    }

    // Check if user has enough points
    if (userPoints < tip.points_required) {
      res.status(403).json({
        message: 'Not enough points to unlock this tip',
        points_needed: tip.points_required - userPoints
      });
      return;
    }

    res.json({
      ...tip,
      is_unlocked: true
    });
  } catch (error) {
    console.error('Error fetching expert advice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 