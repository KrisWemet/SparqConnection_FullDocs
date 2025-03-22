import mongoose, { Document, Schema } from 'mongoose';

export interface IForumComment extends Document {
  post: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ForumCommentSchema = new Schema<IForumComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
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
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
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

// Virtual for nested replies count
ForumCommentSchema.virtual('repliesCount', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Indexes for efficient queries
ForumCommentSchema.index({ post: 1, createdAt: -1 });
ForumCommentSchema.index({ author: 1, createdAt: -1 });
ForumCommentSchema.index({ parentComment: 1 });
ForumCommentSchema.index({ isFlagged: 1, isModerated: 1 });

export default mongoose.model<IForumComment>('ForumComment', ForumCommentSchema); 