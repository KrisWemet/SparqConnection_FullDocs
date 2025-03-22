import mongoose, { Document, Schema } from 'mongoose';
import { IUserDocument } from './User';

export interface IBadge {
  type: string;
  name: string;
  description: string;
  icon: string;
  earned_at: Date;
}

export interface IGamification extends Document {
  user: IUserDocument['_id'];
  points: number;
  current_streak: number;
  longest_streak: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  daily_responses: number;
  points_history: Array<{
    date: Date;
    points: number;
    source: string;
  }>;
  streak_history: Array<{
    date: Date;
    streak: number;
  }>;
  badges: IBadge[];
  last_activity: Date;
  quiz_categories_completed: string[];
  mood_entries: number;
}

const BadgeSchema = new Schema<IBadge>({
  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earned_at: { type: Date, required: true }
});

const GamificationSchema = new Schema<IGamification>({
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

export default mongoose.model<IGamification>('Gamification', GamificationSchema); 