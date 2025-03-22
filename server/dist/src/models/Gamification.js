import mongoose, { Schema } from 'mongoose';
const BadgeSchema = new Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    earned_at: { type: Date, required: true }
});
const GamificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
export default mongoose.model('Gamification', GamificationSchema);
