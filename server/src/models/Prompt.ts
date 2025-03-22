import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  prompt_id: string;
  prompt_text: string;
  category: string;
  created_at: Date;
  active: boolean;
}

const PromptSchema = new Schema({
  prompt_id: {
    type: String,
    required: true,
    unique: true
  },
  prompt_text: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['relationship', 'communication', 'intimacy', 'goals', 'daily']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model<IPrompt>('Prompt', PromptSchema); 