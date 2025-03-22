import { Types } from 'mongoose';
import { FirebaseUser } from '../middleware/auth';

declare global {
  namespace Express {
    interface User extends FirebaseUser {}
  }
}

export {}; 