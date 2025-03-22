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
exports.responseService = exports.forumService = exports.gamificationService = exports.userService = exports.expertAdviceService = exports.quizService = exports.promptService = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.promptService = {
    getTodayPrompt() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            const promptsRef = firebase_1.db.collection('prompts');
            const query = yield promptsRef
                .where('date', '==', todayStr)
                .where('active', '==', true)
                .limit(1)
                .get();
            if (query.empty) {
                // If no prompt for today, get a random active prompt
                const allPromptsQuery = yield promptsRef
                    .where('active', '==', true)
                    .get();
                if (allPromptsQuery.empty)
                    return null;
                const prompts = allPromptsQuery.docs;
                const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
                const promptData = randomPrompt.data();
                return Object.assign(Object.assign({}, promptData), { prompt_id: randomPrompt.id });
            }
            const prompt = query.docs[0];
            const promptData = prompt.data();
            return Object.assign(Object.assign({}, promptData), { prompt_id: prompt.id });
        });
    }
};
exports.quizService = {
    getAllQuizzes() {
        return __awaiter(this, void 0, void 0, function* () {
            const quizzesRef = firebase_1.db.collection('quizzes');
            const query = yield quizzesRef
                .where('active', '==', true)
                .get();
            return query.docs.map(doc => (Object.assign(Object.assign({}, doc.data()), { id: doc.id })));
        });
    },
    getQuizById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const quizDoc = yield firebase_1.db.collection('quizzes').doc(id).get();
            if (!quizDoc.exists)
                return null;
            return Object.assign(Object.assign({}, quizDoc.data()), { id: quizDoc.id });
        });
    }
};
exports.expertAdviceService = {
    getAllExpertAdvice() {
        return __awaiter(this, void 0, void 0, function* () {
            const adviceRef = firebase_1.db.collection('expertAdvice');
            const query = yield adviceRef
                .orderBy('points_required', 'asc')
                .get();
            return query.docs.map(doc => (Object.assign(Object.assign({}, doc.data()), { id: doc.id })));
        });
    },
    getExpertAdviceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const adviceDoc = yield firebase_1.db.collection('expertAdvice').doc(id).get();
            if (!adviceDoc.exists)
                return null;
            return Object.assign(Object.assign({}, adviceDoc.data()), { id: adviceDoc.id });
        });
    }
};
exports.userService = {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
            const now = new Date();
            const userDoc = yield firebase_1.db.collection('users').add(Object.assign(Object.assign({}, userData), { password: hashedPassword, createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: userDoc.id }, userData), { password: hashedPassword, createdAt: now, updatedAt: now });
        });
    },
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDoc = yield firebase_1.db.collection('users').doc(id).get();
            if (!userDoc.exists)
                return null;
            return Object.assign({ id: userDoc.id }, userDoc.data());
        });
    },
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersRef = firebase_1.db.collection('users');
            const snapshot = yield usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
            if (snapshot.empty)
                return null;
            const userDoc = snapshot.docs[0];
            return Object.assign({ id: userDoc.id }, userDoc.data());
        });
    },
    comparePassword(user, candidatePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(candidatePassword, user.password);
        });
    },
    updateUser(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRef = firebase_1.db.collection('users').doc(id);
            yield userRef.update(Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }));
        });
    }
};
exports.gamificationService = {
    getGamification(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamificationDoc = yield firebase_1.db.collection('gamification').doc(userId).get();
            if (!gamificationDoc.exists)
                return null;
            return Object.assign({ id: gamificationDoc.id }, gamificationDoc.data());
        });
    },
    updateGamification(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamificationRef = firebase_1.db.collection('gamification').doc(userId);
            yield gamificationRef.update(Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }));
        });
    },
    addPoints(userId, points, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamificationRef = firebase_1.db.collection('gamification').doc(userId);
            yield gamificationRef.update({
                points: firestore_1.FieldValue.increment(points),
                points_history: firestore_1.FieldValue.arrayUnion({
                    date: new Date(),
                    points,
                    source
                })
            });
        });
    }
};
exports.forumService = {
    createPost(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const postDoc = yield firebase_1.db.collection('forumPosts').add(Object.assign(Object.assign({}, postData), { createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: postDoc.id }, postData), { createdAt: now, updatedAt: now });
        });
    },
    getPost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const postDoc = yield firebase_1.db.collection('forumPosts').doc(id).get();
            if (!postDoc.exists)
                return null;
            return Object.assign({ id: postDoc.id }, postDoc.data());
        });
    },
    createComment(commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const commentDoc = yield firebase_1.db.collection('forumComments').add(Object.assign(Object.assign({}, commentData), { createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: commentDoc.id }, commentData), { createdAt: now, updatedAt: now });
        });
    },
    getPostComments(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentsSnapshot = yield firebase_1.db.collection('forumComments')
                .where('postId', '==', postId)
                .orderBy('createdAt', 'asc')
                .get();
            return commentsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    }
};
exports.responseService = {
    createPromptResponse(responseData) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const responseDoc = yield firebase_1.db.collection('promptResponses').add(Object.assign(Object.assign({}, responseData), { createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: responseDoc.id }, responseData), { createdAt: now, updatedAt: now });
        });
    },
    createQuizResponse(responseData) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseDoc = yield firebase_1.db.collection('quizResponses').add(responseData);
            return Object.assign({ id: responseDoc.id }, responseData);
        });
    },
    getUserPromptResponses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const responsesSnapshot = yield firebase_1.db.collection('promptResponses')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            return responsesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    },
    getUserQuizResponses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const responsesSnapshot = yield firebase_1.db.collection('quizResponses')
                .where('userId', '==', userId)
                .orderBy('completedAt', 'desc')
                .get();
            return responsesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    }
};
