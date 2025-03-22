import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';
export const promptService = {
    async getTodayPrompt() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        const promptsRef = db.collection('prompts');
        const query = await promptsRef
            .where('date', '==', todayStr)
            .where('active', '==', true)
            .limit(1)
            .get();
        if (query.empty) {
            // If no prompt for today, get a random active prompt
            const allPromptsQuery = await promptsRef
                .where('active', '==', true)
                .get();
            if (allPromptsQuery.empty)
                return null;
            const prompts = allPromptsQuery.docs;
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            const promptData = randomPrompt.data();
            return {
                ...promptData,
                prompt_id: randomPrompt.id
            };
        }
        const prompt = query.docs[0];
        const promptData = prompt.data();
        return {
            ...promptData,
            prompt_id: prompt.id
        };
    }
};
export const quizService = {
    async getAllQuizzes() {
        const quizzesRef = db.collection('quizzes');
        const query = await quizzesRef
            .where('active', '==', true)
            .get();
        return query.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    },
    async getQuizById(id) {
        const quizDoc = await db.collection('quizzes').doc(id).get();
        if (!quizDoc.exists)
            return null;
        return {
            ...quizDoc.data(),
            id: quizDoc.id
        };
    }
};
export const expertAdviceService = {
    async getAllExpertAdvice() {
        const adviceRef = db.collection('expertAdvice');
        const query = await adviceRef
            .orderBy('points_required', 'asc')
            .get();
        return query.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    },
    async getExpertAdviceById(id) {
        const adviceDoc = await db.collection('expertAdvice').doc(id).get();
        if (!adviceDoc.exists)
            return null;
        return {
            ...adviceDoc.data(),
            id: adviceDoc.id
        };
    }
};
export const userService = {
    async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const now = new Date();
        const userDoc = await db.collection('users').add({
            ...userData,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
        });
        return {
            id: userDoc.id,
            ...userData,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
        };
    },
    async getUserById(id) {
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists)
            return null;
        return { id: userDoc.id, ...userDoc.data() };
    },
    async getUserByEmail(email) {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
        if (snapshot.empty)
            return null;
        const userDoc = snapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
    },
    async comparePassword(user, candidatePassword) {
        return bcrypt.compare(candidatePassword, user.password);
    },
    async updateUser(id, updateData) {
        const userRef = db.collection('users').doc(id);
        await userRef.update({
            ...updateData,
            updatedAt: new Date()
        });
    }
};
export const gamificationService = {
    async getGamification(userId) {
        const gamificationDoc = await db.collection('gamification').doc(userId).get();
        if (!gamificationDoc.exists)
            return null;
        return { id: gamificationDoc.id, ...gamificationDoc.data() };
    },
    async updateGamification(userId, updateData) {
        const gamificationRef = db.collection('gamification').doc(userId);
        await gamificationRef.update({
            ...updateData,
            updatedAt: new Date()
        });
    },
    async addPoints(userId, points, source) {
        const gamificationRef = db.collection('gamification').doc(userId);
        await gamificationRef.update({
            points: FieldValue.increment(points),
            points_history: FieldValue.arrayUnion({
                date: new Date(),
                points,
                source
            })
        });
    }
};
export const forumService = {
    async createPost(postData) {
        const now = new Date();
        const postDoc = await db.collection('forumPosts').add({
            ...postData,
            createdAt: now,
            updatedAt: now
        });
        return {
            id: postDoc.id,
            ...postData,
            createdAt: now,
            updatedAt: now
        };
    },
    async getPost(id) {
        const postDoc = await db.collection('forumPosts').doc(id).get();
        if (!postDoc.exists)
            return null;
        return { id: postDoc.id, ...postDoc.data() };
    },
    async createComment(commentData) {
        const now = new Date();
        const commentDoc = await db.collection('forumComments').add({
            ...commentData,
            createdAt: now,
            updatedAt: now
        });
        return {
            id: commentDoc.id,
            ...commentData,
            createdAt: now,
            updatedAt: now
        };
    },
    async getPostComments(postId) {
        const commentsSnapshot = await db.collection('forumComments')
            .where('postId', '==', postId)
            .orderBy('createdAt', 'asc')
            .get();
        return commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
};
export const responseService = {
    async createPromptResponse(responseData) {
        const now = new Date();
        const responseDoc = await db.collection('promptResponses').add({
            ...responseData,
            createdAt: now,
            updatedAt: now
        });
        return {
            id: responseDoc.id,
            ...responseData,
            createdAt: now,
            updatedAt: now
        };
    },
    async createQuizResponse(responseData) {
        const responseDoc = await db.collection('quizResponses').add(responseData);
        return {
            id: responseDoc.id,
            ...responseData
        };
    },
    async getUserPromptResponses(userId) {
        const responsesSnapshot = await db.collection('promptResponses')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return responsesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },
    async getUserQuizResponses(userId) {
        const responsesSnapshot = await db.collection('quizResponses')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .get();
        return responsesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
};
