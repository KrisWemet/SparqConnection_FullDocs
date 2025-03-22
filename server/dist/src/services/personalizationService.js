import { db } from '../config/firebase';
export class PersonalizationService {
    async getUserPreferences(userId) {
        try {
            const prefsDoc = await db.collection('userPreferences').doc(userId).get();
            return prefsDoc.exists ? prefsDoc.data() : null;
        }
        catch (error) {
            console.error('Error fetching user preferences:', error);
            return null;
        }
    }
    async updateUserPreferences(userId, updates) {
        try {
            await db.collection('userPreferences').doc(userId).set({
                ...updates,
                updatedAt: new Date()
            }, { merge: true });
        }
        catch (error) {
            console.error('Error updating user preferences:', error);
        }
    }
    async calculateTopicPreferences(userId) {
        const topicPreferences = {};
        try {
            // Analyze prompt responses
            const promptResponses = await db.collection('promptResponses')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            const promptResponsesData = promptResponses.docs.map(doc => doc.data());
            // Get prompt data for each response
            const prompts = await Promise.all(promptResponsesData.map(async (response) => {
                const promptDoc = await db.collection('prompts').doc(response.promptId).get();
                return promptDoc.exists ? promptDoc.data() : null;
            }));
            // Count topic occurrences
            const topicCounts = {};
            let totalResponses = 0;
            prompts.forEach(prompt => {
                if (prompt?.topic) {
                    topicCounts[prompt.topic] = (topicCounts[prompt.topic] || 0) + 1;
                    totalResponses++;
                }
            });
            // Calculate engagement scores (0-1)
            Object.entries(topicCounts).forEach(([topic, count]) => {
                topicPreferences[topic] = count / totalResponses;
            });
            // Add quiz performance data
            const quizResponses = await db.collection('quizResponses')
                .where('userId', '==', userId)
                .orderBy('completedAt', 'desc')
                .limit(20)
                .get();
            const quizResponsesData = quizResponses.docs.map(doc => doc.data());
            // Get quiz data for each response
            const quizzes = await Promise.all(quizResponsesData.map(async (response) => {
                const quizDoc = await db.collection('quizzes').doc(response.quizId).get();
                if (!quizDoc.exists)
                    return null;
                const quizData = quizDoc.data();
                return {
                    ...quizData,
                    score: response.totalScore
                };
            }));
            // Adjust preferences based on quiz performance
            quizzes.forEach(quiz => {
                if (quiz?.topic && quiz?.score !== undefined) {
                    const performanceBonus = (quiz.score / 100) * 0.2; // Up to 0.2 bonus for perfect scores
                    topicPreferences[quiz.topic] = (topicPreferences[quiz.topic] || 0) + performanceBonus;
                }
            });
        }
        catch (error) {
            console.error('Error calculating topic preferences:', error);
        }
        return topicPreferences;
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
    async getPersonalizedContent(userId, contentType) {
        try {
            // Get or initialize user preferences
            let prefs = await this.getUserPreferences(userId);
            if (!prefs) {
                const topicPreferences = await this.calculateTopicPreferences(userId);
                // Get user's quiz scores
                const quizResponses = await db.collection('quizResponses')
                    .where('userId', '==', userId)
                    .orderBy('completedAt', 'desc')
                    .limit(10)
                    .get();
                const quizResponsesData = quizResponses.docs.map(doc => doc.data());
                const scores = quizResponsesData.map(response => response.totalScore);
                // Get user's gamification data
                const gamificationDoc = await db.collection('gamification').doc(userId).get();
                const gamificationData = gamificationDoc.exists
                    ? gamificationDoc.data()
                    : null;
                prefs = {
                    userId,
                    topicPreferences,
                    difficultyLevel: this.calculateDifficultyLevel(gamificationData?.daily_responses || 0, scores, gamificationData?.current_streak || 0),
                    responseFrequency: gamificationData?.daily_responses || 0,
                    lastTopics: [],
                    updatedAt: new Date()
                };
                await this.updateUserPreferences(userId, prefs);
            }
            // Query content based on preferences
            const contentQueries = [];
            if (contentType === 'prompt' || contentType === 'both') {
                contentQueries.push(this.getPersonalizedPrompts(prefs));
            }
            if (contentType === 'quiz' || contentType === 'both') {
                contentQueries.push(this.getPersonalizedQuizzes(prefs));
            }
            const results = await Promise.all(contentQueries);
            return results.flat();
        }
        catch (error) {
            console.error('Error getting personalized content:', error);
            return [];
        }
    }
    async getPersonalizedPrompts(prefs) {
        const topTopics = Object.entries(prefs.topicPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);
        // Ensure we have at least one topic, even if user preferences are empty
        const topics = topTopics.length > 0 ? topTopics : ['general'];
        const promptsQuery = db.collection('prompts')
            .where('difficulty', '<=', prefs.difficultyLevel)
            .where('topic', 'in', topics)
            .limit(5);
        const promptsSnapshot = await promptsQuery.get();
        return promptsSnapshot.docs.map(doc => ({
            id: doc.id,
            type: 'prompt',
            ...doc.data()
        }));
    }
    async getPersonalizedQuizzes(prefs) {
        const topTopics = Object.entries(prefs.topicPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);
        // Ensure we have at least one topic, even if user preferences are empty
        const topics = topTopics.length > 0 ? topTopics : ['general'];
        const quizzesQuery = db.collection('quizzes')
            .where('difficulty', '<=', prefs.difficultyLevel)
            .where('topic', 'in', topics)
            .limit(3);
        const quizzesSnapshot = await quizzesQuery.get();
        return quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            type: 'quiz',
            ...doc.data()
        }));
    }
}
export const personalizationService = new PersonalizationService();
