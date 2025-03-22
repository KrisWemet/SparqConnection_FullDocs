import { Request, Response } from 'express';

export const getTodayPrompt = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      id: '1',
      text: 'What is one small thing you can do today to improve your mental health?',
      date: new Date().toISOString(),
      category: 'mental-health'
    }
  });
};

export const submitPromptResponse = async (req: Request, res: Response) => {
  try {
    const { response, promptId } = req.body;
    
    if (!response || !promptId) {
      return res.status(400).json({
        success: false,
        message: 'Response and promptId are required'
      });
    }
    
    // In a real implementation, you would save this to your database
    
    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        id: '123',
        response,
        promptId,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 