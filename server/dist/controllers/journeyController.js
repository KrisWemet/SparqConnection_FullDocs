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
exports.getUserJourneyProgress = exports.updateJourneyProgress = exports.startJourney = exports.getJourneyById = exports.getJourneys = void 0;
const firebase_1 = require("../config/firebase");
const journeyLogger_1 = require("../utils/journeyLogger");
const getJourneys = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection('journeys').get();
        const journeys = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json({
            success: true,
            data: journeys,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching journeys',
        });
    }
});
exports.getJourneys = getJourneys;
const getJourneyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const userId = req.user.uid;
        const journeyDoc = yield firebase_1.db.collection('journeys').doc(id).get();
        if (!journeyDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found',
            });
        }
        const progressDoc = yield firebase_1.db
            .collection('journeyProgress')
            .doc(`${userId}_${id}`)
            .get();
        const journeyData = journeyDoc.data();
        const progressData = progressDoc.exists ?
            progressDoc.data() :
            { currentDay: 1, reflections: {} };
        const journey = Object.assign(Object.assign({ id: journeyDoc.id }, journeyData), { progress: progressData });
        res.json({
            success: true,
            data: journey,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching journey',
        });
    }
});
exports.getJourneyById = getJourneyById;
const startJourney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { journeyId } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const userId = req.user.uid;
        // Check if journey exists
        const journeyDoc = yield firebase_1.db.collection('journeys').doc(journeyId).get();
        if (!journeyDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found',
            });
        }
        const journeyData = journeyDoc.data();
        // Initialize journey progress
        yield firebase_1.db
            .collection('journeyProgress')
            .doc(`${userId}_${journeyId}`)
            .set({
            currentDay: 1,
            reflections: {},
            startedAt: new Date(),
        });
        // Log journey start event
        journeyLogger_1.logJourneyEvent.start(userId, journeyId, {
            journeyTitle: journeyData === null || journeyData === void 0 ? void 0 : journeyData.title,
        });
        res.json({
            success: true,
            message: 'Journey started successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting journey',
        });
    }
});
exports.startJourney = startJourney;
const updateJourneyProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { journeyId, day, reflection } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const userId = req.user.uid;
        // Validate input
        if (!day || day < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid day number',
            });
        }
        if (!reflection || reflection.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reflection is required',
            });
        }
        const progressRef = firebase_1.db.collection('journeyProgress').doc(`${userId}_${journeyId}`);
        const progressDoc = yield progressRef.get();
        if (!progressDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Journey progress not found',
            });
        }
        const currentProgress = progressDoc.data();
        const journeyDoc = yield firebase_1.db.collection('journeys').doc(journeyId).get();
        const journeyData = journeyDoc.data();
        const isLastDay = day === (journeyData === null || journeyData === void 0 ? void 0 : journeyData.duration);
        // Update progress
        yield progressRef.update(Object.assign({ currentDay: day + 1, [`reflections.${day}`]: {
                reflection,
                completed: true,
                timestamp: new Date(),
            } }, (isLastDay && { completedAt: new Date() })));
        // Log reflection submission
        journeyLogger_1.logJourneyEvent.reflectionSubmit(userId, journeyId, day, reflection.length, {
            journeyTitle: journeyData === null || journeyData === void 0 ? void 0 : journeyData.title,
        });
        // Log day completion
        journeyLogger_1.logJourneyEvent.dayComplete(userId, journeyId, day, {
            journeyTitle: journeyData === null || journeyData === void 0 ? void 0 : journeyData.title,
        });
        // If this was the last day, log journey completion
        if (isLastDay) {
            journeyLogger_1.logJourneyEvent.journeyComplete(userId, journeyId, {
                journeyTitle: journeyData === null || journeyData === void 0 ? void 0 : journeyData.title,
                totalDays: journeyData === null || journeyData === void 0 ? void 0 : journeyData.duration,
            });
        }
        res.json({
            success: true,
            message: 'Progress updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating progress',
        });
    }
});
exports.updateJourneyProgress = updateJourneyProgress;
const getUserJourneyProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const userId = req.user.uid;
        // Get all journeys
        const journeysSnapshot = yield firebase_1.db.collection('journeys').get();
        const journeys = journeysSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Get user's progress for all journeys
        const progressPromises = journeys.map((journey) => __awaiter(void 0, void 0, void 0, function* () {
            const progressDoc = yield firebase_1.db
                .collection('journeyProgress')
                .doc(`${userId}_${journey.id}`)
                .get();
            const progress = progressDoc.exists ? progressDoc.data() : null;
            const completedDays = progress ?
                Object.keys(progress.reflections || {}).length :
                0;
            let lastActivity = null;
            if (progress && progress.reflections && Object.keys(progress.reflections).length > 0) {
                const timestamps = Object.values(progress.reflections)
                    .map(r => {
                    const timestamp = r.timestamp;
                    return timestamp instanceof Date ? timestamp : timestamp === null || timestamp === void 0 ? void 0 : timestamp.toDate();
                })
                    .filter(Boolean);
                if (timestamps.length > 0) {
                    lastActivity = new Date(Math.max(...timestamps.map(d => d.getTime())));
                }
            }
            const result = {
                journeyId: journey.id,
                title: journey.title,
                description: journey.description,
                totalDays: journey.duration,
                completedDays,
                currentDay: progress ? progress.currentDay : 1,
                startedAt: (progress === null || progress === void 0 ? void 0 : progress.startedAt) || null,
                lastActivity,
                isComplete: (progress === null || progress === void 0 ? void 0 : progress.completedAt) ? true : false,
            };
            return result;
        }));
        const userProgress = yield Promise.all(progressPromises);
        // Sort by last activity (most recent first) and started journeys first
        const sortedProgress = userProgress.sort((a, b) => {
            var _a, _b, _c, _d;
            // Started journeys come before not started
            if (a.startedAt && !b.startedAt)
                return -1;
            if (!a.startedAt && b.startedAt)
                return 1;
            // Sort by last activity
            const aTime = ((_a = a.lastActivity) === null || _a === void 0 ? void 0 : _a.getTime()) ||
                (a.startedAt instanceof Date ? a.startedAt.getTime() :
                    (_b = a.startedAt) === null || _b === void 0 ? void 0 : _b.toDate().getTime()) || 0;
            const bTime = ((_c = b.lastActivity) === null || _c === void 0 ? void 0 : _c.getTime()) ||
                (b.startedAt instanceof Date ? b.startedAt.getTime() :
                    (_d = b.startedAt) === null || _d === void 0 ? void 0 : _d.toDate().getTime()) || 0;
            return bTime - aTime;
        });
        res.json({
            success: true,
            data: sortedProgress,
        });
    }
    catch (error) {
        console.error('Error fetching user journey progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching journey progress',
        });
    }
});
exports.getUserJourneyProgress = getUserJourneyProgress;
