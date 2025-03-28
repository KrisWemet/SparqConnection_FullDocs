import mongoose, { Document, Schema } from 'mongoose';

export interface IForumPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ForumPostSchema = new Schema<IForumPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 20
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['General', 'Advice', 'Success Stories', 'Support', 'Events']
    },
    tags: [{
      type: String,
      trim: true
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isModerated: {
      type: Boolean,
      default: false
    },
    isFlagged: {
      type: Boolean,
      default: false
    },
    moderationNotes: {
      type: String,
      default: null
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

// Virtual for comment count
ForumPostSchema.virtual('commentCount', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Index for efficient queries
ForumPostSchema.index({ category: 1, createdAt: -1 });
ForumPostSchema.index({ author: 1, createdAt: -1 });
ForumPostSchema.index({ isFlagged: 1, isModerated: 1 });

export default mongoose.model<IForumPost>('ForumPost', ForumPostSchema); 