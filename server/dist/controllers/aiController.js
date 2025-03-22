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
exports.getPersonalizedContent = void 0;
const aiService_1 = require("../services/aiService");
const PromptResponse_1 = __importDefault(require("../models/PromptResponse"));
const QuizResult_1 = __importDefault(require("../models/QuizResult"));
const Prompt_1 = __importDefault(require("../models/Prompt"));
const Quiz_1 = __importDefault(require("../models/Quiz"));
const aiService = new aiService_1.AIPersonalizationService();
const getPersonalizedContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Fetch user's history
        const [promptResponses, quizResults, availablePrompts, availableQuizzes] = yield Promise.all([
            PromptResponse_1.default.find({ user: userId }).sort({ createdAt: -1 }).populate('prompt'),
            QuizResult_1.default.find({ user: userId }).sort({ createdAt: -1 }),
            Prompt_1.default.find({ isActive: true }),
            Quiz_1.default.find({ isActive: true })
        ]);
        // Get personalized recommendations
        const personalizedContent = yield aiService.getPersonalizedContent(req.user, promptResponses, quizResults, {
            prompts: availablePrompts,
            quizzes: availableQuizzes
        });
        res.json({
            success: true,
            data: personalizedContent
        });
    }
    catch (error) {
        console.error('Error generating personalized content:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating personalized content'
        });
    }
});
exports.getPersonalizedContent = getPersonalizedContent;
