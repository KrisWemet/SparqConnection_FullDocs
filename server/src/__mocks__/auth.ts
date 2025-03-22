import { Request, Response, NextFunction } from 'express';
import type { IUser } from '../models/User';

export const authenticateToken = jest.fn((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: 'user1',
    id: 'user1',
    uid: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedPassword',
    isModerator: false,
    isAdmin: false,
    lastLogin: new Date(),
    role: 'user',
    fcmToken: undefined,
    notificationPreferences: {
      dailyPrompts: true,
      quizzes: true,
      achievements: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: async (candidatePassword: string) => true
  } as unknown as IUser;
  next();
}); 