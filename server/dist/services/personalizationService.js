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
exports.personalizationService = exports.PersonalizationService = void 0;
const firebase_1 = require("../config/firebase");
class PersonalizationService {
    getUserPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prefsDoc = yield firebase_1.db.collection('userPreferences').doc(userId).get();
                return prefsDoc.exists ? prefsDoc.data() : null;
            }
            catch (error) {
                console.error('Error fetching user preferences:', error);
                return null;
            }
        });
    }
    updateUserPreferences(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection('userPreferences').doc(userId).set(Object.assign(Object.assign({}, updates), { updatedAt: new Date() }), { merge: true });
            }
            catch (error) {
                console.error('Error updating user preferences:', error);
            }
        });
    }
    calculateTopicPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const topicPreferences = {};
            try {
                // Analyze prompt responses
                const promptResponses = yield firebase_1.db.collection('promptResponses')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                const promptResponsesData = promptResponses.docs.map(doc => doc.data());
                // Get prompt data for each response
                const prompts = yield Promise.all(promptResponsesData.map((response) => __awaiter(this, void 0, void 0, function* () {
                    const promptDoc = yield firebase_1.db.collection('prompts').doc(response.promptId).get();
                    return promptDoc.exists ? promptDoc.data() : null;
                })));
                // Count topic occurrences
                const topicCounts = {};
                let totalResponses = 0;
                prompts.forEach(prompt => {
                    if (prompt === null || prompt === void 0 ? void 0 : prompt.topic) {
                        topicCounts[prompt.topic] = (topicCounts[prompt.topic] || 0) + 1;
                        totalResponses++;
                    }
                });
                // Calculate engagement scores (0-1)
                Object.entries(topicCounts).forEach(([topic, count]) => {
                    topicPreferences[topic] = count / totalResponses;
                });
                // Add quiz performance data
                const quizResponses = yield firebase_1.db.collection('quizResponses')
                    .where('userId', '==', userId)
                    .orderBy('completedAt', 'desc')
                    .limit(20)
                    .get();
                const quizResponsesData = quizResponses.docs.map(doc => doc.data());
                // Get quiz data for each response
                const quizzes = yield Promise.all(quizResponsesData.map((response) => __awaiter(this, void 0, void 0, function* () {
                    const quizDoc = yield firebase_1.db.collection('quizzes').doc(response.quizId).get();
                    if (!quizDoc.exists)
                        return null;
                    const quizData = quizDoc.data();
                    return Object.assign(Object.assign({}, quizData), { score: response.totalScore });
                })));
                // Adjust preferences based on quiz performance
                quizzes.forEach(quiz => {
                    if ((quiz === null || quiz === void 0 ? void 0 : quiz.topic) && (quiz === null || quiz === void 0 ? void 0 : quiz.score) !== undefined) {
                        const performanceBonus = (quiz.score / 100) * 0.2; // Up to 0.2 bonus for perfect scores
                        topicPreferences[quiz.topic] = (topicPreferences[quiz.topic] || 0) + performanceBonus;
                    }
                });
            }
            catch (error) {
                console.error('Error calculating topic preferences:', error);
            }
            return topicPreferences;
        });
    }
    calculateDifficultyLevel(promptResponses, quizScores, currentStreak) {
        // Base difficulty on quiz performance and engagement
        const avgQuizScore = quizScores.length > 0
            ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
            : 0;
        const baseLevel = Math.ceil((avgQuizScore / 100) * 5);
        // Adjust for engagement
        const engagementBonus = Math.min(promptResponses / 20, 1); // Cap at 20 responses
        const streakBonus = Math.min(currentStreak / 7, 1); // Cap at 7-day streak
        const adjustedLevel = baseLevel + (engagementBonus + streakBonus) / 2;
        // Ensure difficulty is between 1-5
        return Math.max(1, Math.min(5, Math.round(adjustedLevel)));
    }
    getPersonalizedContent(userId, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get or initialize user preferences
                let prefs = yield this.getUserPreferences(userId);
                if (!prefs) {
                    const topicPreferences = yield this.calculateTopicPreferences(userId);
                    // Get user's quiz scores
                    const quizResponses = yield firebase_1.db.collection('quizResponses')
                        .where('userId', '==', userId)
                        .orderBy('completedAt', 'desc')
                        .limit(10)
                        .get();
                    const quizResponsesData = quizResponses.docs.map(doc => doc.data());
                    const scores = quizResponsesData.map(response => response.totalScore);
                    // Get user's gamification data
                    const gamificationDoc = yield firebase_1.db.collection('gamification').doc(userId).get();
                    const gamificationData = gamificationDoc.exists
                        ? gamificationDoc.data()
                        : null;
                    prefs = {
                        userId,
                        topicPreferences,
                        difficultyLevel: this.calculateDifficultyLevel((gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.daily_responses) || 0, scores, (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.current_streak) || 0),
                        responseFrequency: (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.daily_responses) || 0,
                        lastTopics: [],
                        updatedAt: new Date()
                    };
                    yield this.updateUserPreferences(userId, prefs);
                }
                // Query content based on preferences
                const contentQueries = [];
                if (contentType === 'prompt' || contentType === 'both') {
                    contentQueries.push(this.getPersonalizedPrompts(prefs));
                }
                if (contentType === 'quiz' || contentType === 'both') {
                    contentQueries.push(this.getPersonalizedQuizzes(prefs));
                }
                const results = yield Promise.all(contentQueries);
                return results.flat();
            }
            catch (error) {
                console.error('Error getting personalized content:', error);
                return [];
            }
        });
    }
    getPersonalizedPrompts(prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            const topTopics = Object.entries(prefs.topicPreferences)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([topic]) => topic);
            // Ensure we have at least one topic, even if user preferences are empty
            const topics = topTopics.length > 0 ? topTopics : ['general'];
            const promptsQuery = firebase_1.db.collection('prompts')
                .where('difficulty', '<=', prefs.difficultyLevel)
                .where('topic', 'in', topics)
                .limit(5);
            const promptsSnapshot = yield promptsQuery.get();
            return promptsSnapshot.docs.map(doc => (Object.assign({ id: doc.id, type: 'prompt' }, doc.data())));
        });
    }
    getPersonalizedQuizzes(prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            const topTopics = Object.entries(prefs.topicPreferences)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([topic]) => topic);
            // Ensure we have at least one topic, even if user preferences are empty
            const topics = topTopics.length > 0 ? topTopics : ['general'];
            const quizzesQuery = firebase_1.db.collection('quizzes')
                .where('difficulty', '<=', prefs.difficultyLevel)
                .where('topic', 'in', topics)
                .limit(3);
            const quizzesSnapshot = yield quizzesQuery.get();
            return quizzesSnapshot.docs.map(doc => (Object.assign({ id: doc.id, type: 'quiz' }, doc.data())));
        });
    }
}
exports.PersonalizationService = PersonalizationService;
exports.personalizationService = new PersonalizationService();
