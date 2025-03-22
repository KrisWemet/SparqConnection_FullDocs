import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizResponse extends Document {
  user_id: Schema.Types.ObjectId;
  quiz_id: string;
  answers: Array<{
    question_id: string;
    encryptedData: string; // Encrypted answer data
    iv: string; // Initialization vector
    score: number;
  }>;
  total_score: number;
  completed_at: Date;
}

const QuizResponseSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz_id: {
    type: String,
    required: true
  },
  answers: [{
    question_id: {
      type: String,
      required: true
    },
    encryptedData: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    }
  }],
  total_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  completed_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IQuizResponse>('QuizResponse', QuizResponseSchema); 