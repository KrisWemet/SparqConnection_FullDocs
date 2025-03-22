import { FirebaseUser, AuthRequest } from './middleware/auth';

/**
 * Type guard to check if a user object is a FirebaseUser
 */
function isFirebaseUser(user: any): user is FirebaseUser {
  return user && 
    typeof user === 'object' && 
    typeof user.uid === 'string' &&
    typeof user.id === 'string' &&
    typeof user.role === 'string';
}

/**
 * Helper type guard to check if request is authenticated
 */
function isAuthenticated(req: Express.Request): req is AuthRequest & { user: FirebaseUser } {
  return req.user !== undefined && isFirebaseUser(req.user);
}

/**
 * Backward compatibility with MongoDB document types
 */
interface MongoDocument {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Add support for Firebase Firestore document types
interface FirestoreDocument {
  id: string;
  createdAt?: FirebaseFirestore.Timestamp | Date;
  updatedAt?: FirebaseFirestore.Timestamp | Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: FirebaseUser;
    }
  }
}

// Type for request with authenticated user
declare type AuthenticatedRequest = Express.Request & {
  user: FirebaseUser;
};

// Helper type guard to check if request is authenticated
function isAuthenticated(req: Express.Request): req is AuthenticatedRequest {
  return req.user !== undefined && isFirebaseUser(req.user);
} 