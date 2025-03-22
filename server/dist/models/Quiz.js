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
exports.quizService = void 0;
const firebase_1 = require("../config/firebase");
class QuizService {
    constructor() {
        this.collection = firebase_1.db.collection('quizzes');
    }
    createQuiz(quizData) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const quizDoc = yield this.collection.add(Object.assign(Object.assign({}, quizData), { createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: quizDoc.id }, quizData), { createdAt: now, updatedAt: now });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.collection.doc(id).get();
            if (!doc.exists)
                return null;
            return Object.assign({ id: doc.id }, doc.data());
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield this.collection.get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    }
    findByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield this.collection.where('category', '==', category).get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    }
    updateQuiz(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.doc(id).update(Object.assign(Object.assign({}, update), { updatedAt: new Date() }));
        });
    }
    deleteQuiz(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.doc(id).delete();
        });
    }
}
exports.quizService = new QuizService();
// Default export for use in import statements
exports.default = exports.quizService;
