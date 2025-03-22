import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as serviceAccount from './firebase-admin.json';

export const initializeFirebase = () => {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
};

export const db = getFirestore();
export const auth = getAuth();

export default { db, auth, initializeFirebase }; 