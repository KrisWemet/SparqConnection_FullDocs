import { jest, describe, it, beforeAll, beforeEach, afterAll, expect } from '@jest/globals';
import { promptService, quizService, expertAdviceService } from '../services/firestoreService';

// Mock Firebase Admin
jest.mock('../config/firebase', () => ({
  __esModule: true,
  default: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            empty: false,
            docs: [{
              id: 'test-prompt-1',
              data: () => ({
                prompt_text: 'Test prompt',
                category: 'relationship',
                date: new Date().toISOString().split('T')[0],
                active: true
              })
            }]
          }))
        }))
      })),
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          id: 'test-quiz-1',
          data: () => ({
            title: 'Test Quiz',
            description: 'A test quiz',
            category: 'relationship',
            questions: [
              {
                question: 'Test question?',
                options: [
                  { text: 'Option 1', score: 5 },
                  { text: 'Option 2', score: 3 }
                ]
              }
            ],
            active: true
          })
        }))
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          docs: [{
            id: 'test-advice-1',
            data: () => ({
              title: 'Test Advice',
              content: ['Test content'],
              points_required: 50,
              category: 'communication',
              expert: {
                name: 'Dr. Test',
                credentials: 'PhD in Testing'
              },
              publishedAt: new Date().toISOString()
            })
          }]
        }))
      }))
    }))
  }
}));

describe('Firestore Service', () => {
  describe('promptService', () => {
    it('should fetch today\'s prompt', async () => {
      const prompt = await promptService.getTodayPrompt();
      expect(prompt).toBeDefined();
      expect(prompt?.prompt_id).toBe('test-prompt-1');
      expect(prompt?.prompt_text).toBe('Test prompt');
      expect(prompt?.category).toBe('relationship');
    });
  });

  describe('quizService', () => {
    it('should fetch a quiz by ID', async () => {
      const quiz = await quizService.getQuizById('test-quiz-1');
      expect(quiz).toBeDefined();
      expect(quiz?.id).toBe('test-quiz-1');
      expect(quiz?.title).toBe('Test Quiz');
      expect(quiz?.questions).toHaveLength(1);
    });
  });

  describe('expertAdviceService', () => {
    it('should fetch all expert advice', async () => {
      const advice = await expertAdviceService.getAllExpertAdvice();
      expect(advice).toHaveLength(1);
      expect(advice[0].id).toBe('test-advice-1');
      expect(advice[0].title).toBe('Test Advice');
      expect(advice[0].points_required).toBe(50);
    });
  });
}); 