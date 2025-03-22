import mongoose, { Schema } from 'mongoose';
const PromptResponseSchema = new Schema({
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
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
export default mongoose.model('PromptResponse', PromptResponseSchema);
