import { getAuth } from 'firebase-admin/auth';
import { db } from '../config/firebase';
/**
 * Authentication middleware that validates Firebase auth tokens
 * and attaches the user to the request object
 */
export const validateAuthToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        req.user = {
            uid: decodedToken.uid,
            id: decodedToken.uid, // Set id to uid for backward compatibility
            _id: decodedToken.uid, // For backward compatibility with MongoDB
            email: decodedToken.email,
            displayName: decodedToken.name,
            role: userData?.role || 'user', // Default to 'user' if not specified
            isModerator: userData?.isModerator || false,
            isAdmin: userData?.isAdmin || false
        };
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
/**
 * Verify if a request has an authenticated user
 */
export function isAuthenticatedRequest(req) {
    return req.user !== undefined;
}
// Alias for backward compatibility
export const authenticateToken = validateAuthToken;
export const authenticate = validateAuthToken;
export const auth = validateAuthToken;
export const authenticateUser = validateAuthToken;
