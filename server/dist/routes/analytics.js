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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const router = express_1.default.Router();
// Get user analytics data
router.get('/user/:userId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!requestingUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Only allow users to access their own data or admins to access any data
        if (requestingUserId !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const userDoc = yield firebase_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const analyticsData = Object.assign({ userId: userDoc.id }, (userData === null || userData === void 0 ? void 0 : userData.analytics) || {});
        res.json(analyticsData);
    }
    catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
}));
// Get engagement metrics
router.get('/metrics', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userDoc = yield firebase_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const metrics = {
            totalLogins: ((_b = userData === null || userData === void 0 ? void 0 : userData.metrics) === null || _b === void 0 ? void 0 : _b.totalLogins) || 0,
            lastLogin: ((_c = userData === null || userData === void 0 ? void 0 : userData.metrics) === null || _c === void 0 ? void 0 : _c.lastLogin) || null,
            sessionDuration: ((_d = userData === null || userData === void 0 ? void 0 : userData.metrics) === null || _d === void 0 ? void 0 : _d.sessionDuration) || 0,
            completedJourneys: ((_e = userData === null || userData === void 0 ? void 0 : userData.metrics) === null || _e === void 0 ? void 0 : _e.completedJourneys) || 0,
            promptResponses: ((_f = userData === null || userData === void 0 ? void 0 : userData.metrics) === null || _f === void 0 ? void 0 : _f.promptResponses) || 0
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
}));
exports.default = router;
