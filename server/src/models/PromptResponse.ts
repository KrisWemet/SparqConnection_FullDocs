import mongoose, { Document, Schema } from 'mongoose';

export interface IPromptResponse extends Document {
  user: mongoose.Types.ObjectId;
  prompt: {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    topic: string;
  };
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromptResponseSchema = new Schema<IPromptResponse>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    prompt: {
      type: Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true
    },
    response: {
      type: String,
      required: true,
      trim: true
    }
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

export default mongoose.model<IPromptResponse>('PromptResponse', PromptResponseSchema); 