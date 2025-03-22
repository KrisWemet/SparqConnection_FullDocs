import { Request, Response } from 'express';
import { quizService } from '../services/firestoreService';
import QuizResponse from '../models/QuizResponse';

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // In a real implementation, you would get actual quizzes from your database
    
    res.status(200).json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Mental Health Basics',
          description: 'Test your knowledge of mental health fundamentals',
          questions: 10,
          timeEstimate: '5 min',
          category: 'mental-health'
        },
        {
          id: '2',
          title: 'Stress Management',
          description: 'Learn how to identify and manage stress',
          questions: 8,
          timeEstimate: '4 min',
          category: 'stress'
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you would get the quiz from your database
    
    if (id === '1') {
      res.status(200).json({
        success: true,
        data: {
          id: '1',
          title: 'Mental Health Basics',
          description: 'Test your knowledge of mental health fundamentals',
          questions: [
            {
              id: 'q1',
              text: 'What is mental health?',
              options: [
                { id: 'a', text: 'The absence of mental illness' },
                { id: 'b', text: 'A state of well-being where you can cope with life\'s stresses' },
                { id: 'c', text: 'Being happy all the time' },
                { id: 'd', text: 'Not feeling anxious or depressed' }
              ],
              correctAnswer: 'b'
            },
            {
              id: 'q2',
              text: 'Which of the following is NOT a good practice for mental wellness?',
              options: [
                { id: 'a', text: 'Regular exercise' },
                { id: 'b', text: 'Isolating yourself when stressed' },
                { id: 'c', text: 'Getting adequate sleep' },
                { id: 'd', text: 'Maintaining social connections' }
              ],
              correctAnswer: 'b'
            }
          ]
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const submitQuizResponse = async (req: Request, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    
    if (!quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers are required'
      });
    }
    
    // In a real implementation, you would validate answers and save to your database
    
    res.status(201).json({
      success: true,
      message: 'Quiz response submitted successfully',
      data: {
        id: '123',
        quizId,
        score: 80,
        correctAnswers: 8,
        totalQuestions: 10,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 