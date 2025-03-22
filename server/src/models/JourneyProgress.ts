import mongoose, { Document, Schema } from 'mongoose';

export interface IJourneyProgress extends Document {
  userId: mongoose.Types.ObjectId;
  journeyId: string;
  currentDay: number;
  reflections: {
    [key: string]: {
      reflection: string; // Encrypted reflection
      iv: string; // Initialization vector
      completed: boolean;
      timestamp: Date;
    };
  };
  startedAt: Date;
  completedAt?: Date;
  lastActivity: Date;
}

const JourneyProgressSchema = new Schema<IJourneyProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  journeyId: {
    type: String,
    required: true
  },
  currentDay: {
    type: Number,
    required: true,
    default: 1
  },
  reflections: {
    type: Map,
    of: {
      reflection: {
        type: String,
        required: true
      },
      iv: {
        type: String,
        required: true
      },
      completed: {
        type: Boolean,
        required: true,
        default: true
      },
      timestamp: {
        type: Date,
        required: true,
        default: Date.now
      }
    }
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for userId and journeyId
JourneyProgressSchema.index({ userId: 1, journeyId: 1 }, { unique: true });

export default mongoose.model<IJourneyProgress>('JourneyProgress', JourneyProgressSchema); 