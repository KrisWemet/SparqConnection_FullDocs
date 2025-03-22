"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPersonalizationService = void 0;
const tf = __importStar(require("@tensorflow/tfjs"));
class AIPersonalizationService {
    constructor() {
        this.model = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a simple neural network
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [6], units: 12, activation: 'relu' }),
                    tf.layers.dense({ units: 8, activation: 'relu' }),
                    tf.layers.dense({ units: 4, activation: 'softmax' })
                ]
            });
            // Compile the model
            this.model.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
        });
    }
    extractUserFeatures(user, promptResponses, quizResults) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Calculate average quiz score
            const averageScore = quizResults.length > 0
                ? quizResults.reduce((acc, result) => acc + result.score, 0) / quizResults.length
                : 0;
            // Calculate response frequency (responses per day)
            const firstResponse = ((_a = promptResponses[0]) === null || _a === void 0 ? void 0 : _a.createdAt) || new Date();
            const daysSinceFirst = Math.max(1, (Date.now() - firstResponse.getTime()) / (1000 * 60 * 60 * 24));
            const responseFrequency = promptResponses.length / daysSinceFirst;
            // Calculate topic preferences
            const topicPreferences = {};
            promptResponses.forEach(response => {
                if (response.prompt.topic) {
                    topicPreferences[response.prompt.topic] = (topicPreferences[response.prompt.topic] || 0) + 1;
                }
            });
            // Calculate engagement level (0-1)
            const engagementLevel = Math.min(1, (responseFrequency * 0.5) + (averageScore * 0.3) + (promptResponses.length > 0 ? 0.2 : 0));
            return {
                averageScore,
                responseFrequency,
                topicPreferences,
                engagementLevel
            };
        });
    }
    preprocessFeatures(features) {
        // Convert features to a normalized tensor
        const featureArray = [
            features.averageScore / 100, // Normalize score to 0-1
            Math.min(1, features.responseFrequency / 5), // Cap at 5 responses per day
            Object.keys(features.topicPreferences).length / 10, // Normalize topic diversity
            features.engagementLevel,
            Math.max(...Object.values(features.topicPreferences)) / 10, // Normalize max topic preference
            Object.values(features.topicPreferences).reduce((a, b) => a + b, 0) / 100 // Normalize total responses
        ];
        return tf.tensor2d([featureArray]);
    }
    getPersonalizedContent(user, promptResponses, quizResults, availableContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model) {
                yield this.initialize();
            }
            const features = yield this.extractUserFeatures(user, promptResponses, quizResults);
            const inputTensor = this.preprocessFeatures(features);
            // Get model predictions
            if (!this.model) {
                throw new Error('Model initialization failed');
            }
            const predictions = this.model.predict(inputTensor);
            const contentTypeScores = yield predictions.array();
            // Clean up tensors
            inputTensor.dispose();
            predictions.dispose();
            // Select content based on predictions and user preferences
            const recommendedContent = {
                prompts: this.selectRecommendedPrompts(availableContent.prompts, features, contentTypeScores[0]),
                quizzes: this.selectRecommendedQuizzes(availableContent.quizzes, features, contentTypeScores[0])
            };
            return {
                recommendations: recommendedContent,
                userInsights: {
                    engagementLevel: features.engagementLevel,
                    topicPreferences: features.topicPreferences,
                    suggestedTopics: this.getSuggestedTopics(features)
                }
            };
        });
    }
    selectRecommendedPrompts(prompts, features, scores) {
        return prompts
            .map(prompt => (Object.assign(Object.assign({}, prompt), { score: this.calculateContentScore(prompt, features, scores) })))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((_a) => {
            var { score } = _a, prompt = __rest(_a, ["score"]);
            return prompt;
        });
    }
    selectRecommendedQuizzes(quizzes, features, scores) {
        return quizzes
            .map(quiz => (Object.assign(Object.assign({}, quiz), { score: this.calculateContentScore(quiz, features, scores) })))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((_a) => {
            var { score } = _a, quiz = __rest(_a, ["score"]);
            return quiz;
        });
    }
    calculateContentScore(content, features, modelScores) {
        const topicScore = content.topic && features.topicPreferences[content.topic]
            ? features.topicPreferences[content.topic] / Math.max(...Object.values(features.topicPreferences))
            : 0.5;
        const difficultyScore = content.difficulty
            ? 1 - Math.abs(features.averageScore / 100 - content.difficulty / 100)
            : 0.5;
        const categoryWeight = content.type === 'prompt' ? modelScores[0] : modelScores[1];
        return (topicScore * 0.4) + (difficultyScore * 0.3) + (categoryWeight * 0.3);
    }
    getSuggestedTopics(features) {
        const lowEngagementTopics = Object.entries(features.topicPreferences)
            .filter(([_, count]) => count < 3)
            .map(([topic, _]) => topic);
        return lowEngagementTopics.length > 0
            ? lowEngagementTopics.slice(0, 3)
            : Object.keys(features.topicPreferences).slice(0, 3);
    }
}
exports.AIPersonalizationService = AIPersonalizationService;
