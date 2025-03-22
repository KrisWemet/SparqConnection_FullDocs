import mongoose, { Schema } from 'mongoose';
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
export default mongoose.model('QuizResponse', QuizResponseSchema);
