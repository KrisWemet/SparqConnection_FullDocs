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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BadgeSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    earned_at: { type: Date, required: true }
});
const GamificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, default: 0 },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    total_quizzes_completed: { type: Number, default: 0 },
    perfect_scores: { type: Number, default: 0 },
    daily_responses: { type: Number, default: 0 },
    points_history: [{
            date: {
                type: Date,
                default: Date.now
            },
            points: {
                type: Number,
                required: true
            },
            source: {
                type: String,
                required: true,
                enum: ['prompt_response', 'quiz_completion', 'streak_bonus', 'badge_earned']
            }
        }],
    streak_history: [{
            date: {
                type: Date,
                default: Date.now
            },
            streak: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    badges: [BadgeSchema],
    last_activity: {
        type: Date,
        default: Date.now
    },
    quiz_categories_completed: [String],
    mood_entries: { type: Number, default: 0 }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Gamification', GamificationSchema);
