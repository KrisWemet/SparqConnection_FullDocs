import mongoose, { Schema } from 'mongoose';
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
export default mongoose.model('Prompt', PromptSchema);
