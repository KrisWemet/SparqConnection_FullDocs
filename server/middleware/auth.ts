import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase';
import { admin } from '../config/firebase';

interface JWTPayload {
  id: string;
  role: string;
}

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    uid: string;
    email?: string;
    displayName?: string;
  };
}

export const verifyAdminToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    // Check if user exists and is an admin
    const userDoc = await db.collection('users').doc(decoded.id).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin privileges required',
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: userData.role,
      uid: decoded.id,
      email: userData.email,
      displayName: userData.displayName,
    };

    next();
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    // Check if user exists
    const userDoc = await db.collection('users').doc(decoded.id).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      uid: decoded.id,
      email: userDoc.data()?.email,
      displayName: userDoc.data()?.displayName,
    };

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const validateAuthToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}; 