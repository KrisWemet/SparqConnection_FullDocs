"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.auth = exports.authenticate = exports.authenticateToken = exports.validateAuthToken = void 0;
exports.isAuthenticatedRequest = isAuthenticatedRequest;
const auth_1 = require("firebase-admin/auth");
const firebase_1 = require("../config/firebase");
/**
 * Authentication middleware that validates Firebase auth tokens
 * and attaches the user to the request object
 */
const validateAuthToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = yield (0, auth_1.getAuth)().verifyIdToken(token);
        const userDoc = yield firebase_1.db.collection('users').doc(decodedToken.uid).get();
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
            role: (userData === null || userData === void 0 ? void 0 : userData.role) || 'user', // Default to 'user' if not specified
            isModerator: (userData === null || userData === void 0 ? void 0 : userData.isModerator) || false,
            isAdmin: (userData === null || userData === void 0 ? void 0 : userData.isAdmin) || false
        };
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.validateAuthToken = validateAuthToken;
/**
 * Verify if a request has an authenticated user
 */
function isAuthenticatedRequest(req) {
    return req.user !== undefined;
}
// Alias for backward compatibility
exports.authenticateToken = exports.validateAuthToken;
exports.authenticate = exports.validateAuthToken;
exports.auth = exports.validateAuthToken;
exports.authenticateUser = exports.validateAuthToken;
