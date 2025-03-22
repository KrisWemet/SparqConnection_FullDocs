import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizResult extends Document {
  user: mongoose.Types.ObjectId;
  quiz: {
    _id: mongoose.Types.ObjectId;
    title: string;
    topic: string;
    difficulty: number;
  };
  score: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    answers: [{
      questionId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      selectedAnswer: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema); 