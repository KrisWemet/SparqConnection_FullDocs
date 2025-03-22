import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  Auth,
  UserCredential 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  
  // Log successful initialization in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Auth utility functions with proper error handling
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Firebase login error:', error.code, error.message);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Firebase registration error:', error.code, error.message);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    return await signOut(auth);
  } catch (error: any) {
    console.error('Firebase logout error:', error.code, error.message);
    throw error;
  }
};

export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Firebase password reset error:', error.code, error.message);
    throw error;
  }
};

export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    return await updateProfile(auth.currentUser, { displayName, photoURL });
  } catch (error: any) {
    console.error('Firebase profile update error:', error.code, error.message);
    throw error;
  }
};

export const observeAuthState = (callback: any) => {
  return onAuthStateChanged(auth, callback);
};

// Check if Firebase configuration is complete
export const validateFirebaseConfig = (): boolean => {
  const requiredKeys = [
    'apiKey', 
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`Missing Firebase configuration: ${key}`);
      return false;
    }
  }
  
  return true;
};

export { app, auth, firestore }; 