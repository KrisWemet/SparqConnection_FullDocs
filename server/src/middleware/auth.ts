import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { auth as firebaseAuth } from '../config/firebase';

/**
 * Define the FirebaseUser interface
 */
export interface FirebaseUser {
  uid: string;
  id: string; // For backward compatibility
  role: string;
  email?: string;
  displayName?: string;
  _id?: string; // For backward compatibility with MongoDB
  isModerator?: boolean; // For backward compatibility
  isAdmin?: boolean; // For backward compatibility
}

// Don't extend the global Express namespace to avoid conflicts with Passport
// Instead, create a separate interface that we'll use in our routes
export interface AuthRequest extends Request {
  user?: FirebaseUser;
}

interface DecodedIdToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Authentication middleware that validates Firebase auth tokens
 * and attaches the user to the request object
 */
export const validateAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Firebase Auth
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    
    // Map the decoded token to our FirebaseUser interface
    const user: FirebaseUser = {
      uid: decodedToken.uid,
      id: decodedToken.uid, // Set id to uid for backward compatibility
      _id: decodedToken.uid, // For backward compatibility with MongoDB
      email: decodedToken.email,
      displayName: decodedToken.name,
      role: decodedToken.role || 'user', // Default to 'user' if not specified
      isModerator: decodedToken.isModerator || false,
      isAdmin: decodedToken.isAdmin || false
    };
    
    // Attach the user to the request
    (req as AuthRequest).user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Verify if a request has an authenticated user
 */
export function isAuthenticatedRequest(req: Request): req is AuthRequest & { user: FirebaseUser } {
  return req.user !== undefined;
}

// Middleware to check if user has admin role
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isAuthenticatedRequest(req)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required'
    });
  }

  next();
};

// JWT authentication using Passport
export const authenticate = passport.authenticate('jwt', { session: false });

// Alias for backward compatibility
export const authenticateToken = validateAuthToken;
export const authMiddleware = validateAuthToken;
export const authenticateUser = validateAuthToken; 