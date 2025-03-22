import { AIPersonalizationService } from '../services/aiService';
import PromptResponse from '../models/PromptResponse';
import QuizResult from '../models/QuizResult';
import Prompt from '../models/Prompt';
import Quiz from '../models/Quiz';
const aiService = new AIPersonalizationService();
export const getPersonalizedContent = async (req, res) => {
    try {
        const userId = req.user?._id;
        // Fetch user's history
        const [promptResponses, quizResults, availablePrompts, availableQuizzes] = await Promise.all([
            PromptResponse.find({ user: userId }).sort({ createdAt: -1 }).populate('prompt'),
            QuizResult.find({ user: userId }).sort({ createdAt: -1 }),
            Prompt.find({ isActive: true }),
            Quiz.find({ isActive: true })
        ]);
        // Get personalized recommendations
        const personalizedContent = await aiService.getPersonalizedContent(req.user, promptResponses, quizResults, {
            prompts: availablePrompts,
            quizzes: availableQuizzes
        });
        res.json({
            success: true,
            data: personalizedContent
        });
    }
    catch (error) {
        console.error('Error generating personalized content:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating personalized content'
        });
    }
};
