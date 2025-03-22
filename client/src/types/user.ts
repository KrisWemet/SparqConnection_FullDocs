import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  privateKey?: string;
  token?: string;
  partnerEmail?: string;
  relationshipStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  getIdToken: () => Promise<string>;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
    timezone?: string;
  };
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  emailUpdates: boolean;
  privacyLevel: 'public' | 'private' | 'friends';
}

export interface UserProfile extends Pick<User, 'id' | 'email' | 'displayName'> {
  bio?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  interests?: string[];
} 