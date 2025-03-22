import Prompt from '../models/Prompt';
import PromptResponse from '../models/PromptResponse';
import { promptService } from '../services/firestoreService';
export const getTodayPrompt = async (req, res) => {
    try {
        const prompt = await promptService.getTodayPrompt();
        if (!prompt) {
            return res.status(404).json({ message: 'No prompts available' });
        }
        // Store the prompt in MongoDB for tracking
        const mongoPrompt = new Prompt({
            prompt_id: prompt.prompt_id,
            prompt_text: prompt.prompt_text,
            category: prompt.category,
            created_at: new Date(),
            active: true
        });
        await mongoPrompt.save();
        res.json({
            prompt_id: prompt.prompt_id,
            prompt_text: prompt.prompt_text,
            category: prompt.category
        });
    }
    catch (error) {
        console.error('Error getting today\'s prompt:', error);
        res.status(500).json({ message: 'Error fetching today\'s prompt' });
    }
};
export const submitPromptResponse = async (req, res) => {
    try {
        const { prompt_id, response_text, mood_score } = req.body;
        if (!prompt_id || !response_text) {
            return res.status(400).json({ message: 'Prompt ID and response text are required' });
        }
        // Create new response
        const promptResponse = new PromptResponse({
            user_id: req.user?._id,
            prompt_id,
            response_text,
            mood_score: mood_score || undefined
        });
        await promptResponse.save();
        res.status(201).json({
            response_id: promptResponse._id,
            message: 'Response saved successfully'
        });
    }
    catch (error) {
        console.error('Error submitting prompt response:', error);
        res.status(500).json({ message: 'Error saving response' });
    }
};
