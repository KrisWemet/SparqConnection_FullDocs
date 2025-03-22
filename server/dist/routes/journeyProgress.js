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
// Get user's journey progress
router.get('/:journeyId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { journeyId } = req.params;
        const progressDoc = yield firebase_1.db.collection('journeyProgress')
            .where('userId', '==', userId)
            .where('journeyId', '==', journeyId)
            .get();
        if (progressDoc.empty) {
            return res.json({
                completed: false,
                currentDay: 0,
                lastCompletedDate: null
            });
        }
        const progress = progressDoc.docs[0].data();
        res.json(Object.assign({ id: progressDoc.docs[0].id }, progress));
    }
    catch (error) {
        console.error('Error fetching journey progress:', error);
        res.status(500).json({ message: 'Error fetching journey progress' });
    }
}));
// Update journey progress
router.post('/:journeyId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { journeyId } = req.params;
        const { completed, currentDay, notes } = req.body;
        // Get existing progress
        const progressQuery = yield firebase_1.db.collection('journeyProgress')
            .where('userId', '==', userId)
            .where('journeyId', '==', journeyId)
            .get();
        let progressRef;
        if (progressQuery.empty) {
            // Create new progress document
            progressRef = firebase_1.db.collection('journeyProgress').doc();
            yield progressRef.set({
                userId,
                journeyId,
                completed: completed || false,
                currentDay: currentDay || 1,
                notes: notes || [],
                startDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        else {
            // Update existing progress
            progressRef = progressQuery.docs[0].ref;
            yield progressRef.update({
                completed: completed !== null && completed !== void 0 ? completed : progressQuery.docs[0].data().completed,
                currentDay: currentDay !== null && currentDay !== void 0 ? currentDay : progressQuery.docs[0].data().currentDay,
                notes: notes !== null && notes !== void 0 ? notes : progressQuery.docs[0].data().notes,
                lastUpdated: new Date().toISOString()
            });
        }
        const updatedDoc = yield progressRef.get();
        res.json(Object.assign({ id: updatedDoc.id }, updatedDoc.data()));
    }
    catch (error) {
        console.error('Error updating journey progress:', error);
        res.status(500).json({ message: 'Error updating journey progress' });
    }
}));
exports.default = router;
