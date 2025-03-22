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
exports.submitPromptResponse = exports.getTodayPrompt = void 0;
const Prompt_1 = __importDefault(require("../models/Prompt"));
const PromptResponse_1 = __importDefault(require("../models/PromptResponse"));
const firestoreService_1 = require("../services/firestoreService");
const getTodayPrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prompt = yield firestoreService_1.promptService.getTodayPrompt();
        if (!prompt) {
            return res.status(404).json({ message: 'No prompts available' });
        }
        // Store the prompt in MongoDB for tracking
        const mongoPrompt = new Prompt_1.default({
            prompt_id: prompt.prompt_id,
            prompt_text: prompt.prompt_text,
            category: prompt.category,
            created_at: new Date(),
            active: true
        });
        yield mongoPrompt.save();
        res.json({
            prompt_id: prompt.prompt_id,
            prompt_text: prompt.prompt_text,
            category: prompt.category
        });
    }
    catch (error) {
        console.error('Error getting today\'s prompt:', error);
        res.status(500).json({ message: 'Error fetching today\'s prompt' });
    }
});
exports.getTodayPrompt = getTodayPrompt;
const submitPromptResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { prompt_id, response_text, mood_score } = req.body;
        if (!prompt_id || !response_text) {
            return res.status(400).json({ message: 'Prompt ID and response text are required' });
        }
        // Create new response
        const promptResponse = new PromptResponse_1.default({
            user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            prompt_id,
            response_text,
            mood_score: mood_score || undefined
        });
        yield promptResponse.save();
        res.status(201).json({
            response_id: promptResponse._id,
            message: 'Response saved successfully'
        });
    }
    catch (error) {
        console.error('Error submitting prompt response:', error);
        res.status(500).json({ message: 'Error saving response' });
    }
});
exports.submitPromptResponse = submitPromptResponse;
