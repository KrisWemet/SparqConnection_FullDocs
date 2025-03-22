import { quizService } from '../services/firestoreService';
import QuizResponse from '../models/QuizResponse';
export const getQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getAllQuizzes();
        res.json(quizzes);
    }
    catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};
export const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await quizService.getQuizById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    }
    catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};
export const submitQuizResponse = async (req, res) => {
    try {
        const { quiz_id, answers } = req.body;
        if (!quiz_id || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Quiz ID and answers array are required' });
        }
        const quiz = await quizService.getQuizById(quiz_id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // Calculate scores for each answer
        const scoredAnswers = answers.map((answer, index) => {
            const question = quiz.questions[index];
            const selectedOption = question.options.find((opt) => opt.text === answer.selected_option);
            return {
                question_id: index.toString(),
                selected_option: answer.selected_option,
                score: selectedOption ? selectedOption.score : 0
            };
        });
        // Calculate total score (normalized to 0-100)
        const maxPossibleScore = quiz.questions.length * 5; // 5 is max score per question
        const totalScore = Math.round((scoredAnswers.reduce((sum, ans) => sum + ans.score, 0) / maxPossibleScore) * 100);
        // Save response to MongoDB
        const quizResponse = new QuizResponse({
            user_id: req.user?._id,
            quiz_id,
            answers: scoredAnswers,
            total_score: totalScore
        });
        await quizResponse.save();
        res.status(201).json({
            response_id: quizResponse._id,
            score: totalScore,
            message: 'Quiz response saved successfully'
        });
    }
    catch (error) {
        console.error('Error submitting quiz response:', error);
        res.status(500).json({ message: 'Error saving quiz response' });
    }
};
