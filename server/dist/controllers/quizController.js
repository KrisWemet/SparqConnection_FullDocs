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
exports.submitQuizResponse = exports.getQuizById = exports.getQuizzes = void 0;
const firestoreService_1 = require("../services/firestoreService");
const QuizResponse_1 = __importDefault(require("../models/QuizResponse"));
const getQuizzes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizzes = yield firestoreService_1.quizService.getAllQuizzes();
        res.json(quizzes);
    }
    catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
});
exports.getQuizzes = getQuizzes;
const getQuizById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const quiz = yield firestoreService_1.quizService.getQuizById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    }
    catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
});
exports.getQuizById = getQuizById;
const submitQuizResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { quiz_id, answers } = req.body;
        if (!quiz_id || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Quiz ID and answers array are required' });
        }
        const quiz = yield firestoreService_1.quizService.getQuizById(quiz_id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // Calculate scores for each answer
        const scoredAnswers = answers.map((answer, index) => {
            const question = quiz.questions[index];
            const selectedOption = question.options.find((opt) => opt.text === answer.selected_option);
            return {
                question_id: index.toString(),
                selected_option: answer.selected_option,
                score: selectedOption ? selectedOption.score : 0
            };
        });
        // Calculate total score (normalized to 0-100)
        const maxPossibleScore = quiz.questions.length * 5; // 5 is max score per question
        const totalScore = Math.round((scoredAnswers.reduce((sum, ans) => sum + ans.score, 0) / maxPossibleScore) * 100);
        // Save response to MongoDB
        const quizResponse = new QuizResponse_1.default({
            user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            quiz_id,
            answers: scoredAnswers,
            total_score: totalScore
        });
        yield quizResponse.save();
        res.status(201).json({
            response_id: quizResponse._id,
            score: totalScore,
            message: 'Quiz response saved successfully'
        });
    }
    catch (error) {
        console.error('Error submitting quiz response:', error);
        res.status(500).json({ message: 'Error saving quiz response' });
    }
});
exports.submitQuizResponse = submitQuizResponse;
