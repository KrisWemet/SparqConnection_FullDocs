import { personalizationService } from '../services/personalizationService';
import { db } from '../config/firebase';

// Mock Firestore
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn()
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          }))
        }))
      }))
    }))
  }
}));

describe('PersonalizationService', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalizedContent', () => {
    it('should return personalized content based on user preferences', async () => {
      // Mock user preferences
      const mockPreferences = {
        userId: mockUserId,
        topicPreferences: {
          'communication': 0.8,
          'trust': 0.6,
          'intimacy': 0.4
        },
        difficultyLevel: 3,
        responseFrequency: 5,
        lastTopics: [],
        updatedAt: new Date()
      };

      // Mock Firestore responses
      const mockPrompts = [
        {
          id: 'prompt-1',
          type: 'prompt',
          topic: 'communication',
          difficulty: 3,
          title: 'Daily Communication',
          content: 'How do you feel about today\'s conversation?',
          category: 'daily'
        }
      ];

      const mockQuizzes = [
        {
          id: 'quiz-1',
          type: 'quiz',
          topic: 'trust',
          difficulty: 2,
          title: 'Trust Building',
          content: 'Test your knowledge about trust',
          category: 'assessment'
        }
      ];

      // Mock Firestore calls
      (db.collection('userPreferences').doc(mockUserId).get as jest.Mock)
        .mockResolvedValue({
          exists: true,
          data: () => mockPreferences
        });

      (db.collection('prompts').where as jest.Mock)
        .mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                docs: mockPrompts.map(prompt => ({
                  id: prompt.id,
                  data: () => prompt
                }))
              })
            })
          })
        });

      (db.collection('quizzes').where as jest.Mock)
        .mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                docs: mockQuizzes.map(quiz => ({
                  id: quiz.id,
                  data: () => quiz
                }))
              })
            })
          })
        });

      // Test getting both prompts and quizzes
      const content = await personalizationService.getPersonalizedContent(mockUserId, 'both');

      expect(content).toHaveLength(2);
      expect(content).toEqual(expect.arrayContaining([
        expect.objectContaining({
          type: 'prompt',
          topic: 'communication'
        }),
        expect.objectContaining({
          type: 'quiz',
          topic: 'trust'
        })
      ]));
    });

    it('should create new preferences for first-time users', async () => {
      // Mock no existing preferences
      (db.collection('userPreferences').doc(mockUserId).get as jest.Mock)
        .mockResolvedValue({
          exists: false
        });

      // Mock user activity data
      const mockPromptResponses = {
        docs: [
          { data: () => ({ promptId: 'prompt-1' }) }
        ]
      };

      const mockQuizResponses = {
        docs: [
          { data: () => ({ quizId: 'quiz-1', totalScore: 85 }) }
        ]
      };

      const mockGamificationData = {
        daily_responses: 10,
        current_streak: 5
      };

      // Mock Firestore queries
      (db.collection('promptResponses').where as jest.Mock)
        .mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockPromptResponses)
            })
          })
        });

      (db.collection('quizResponses').where as jest.Mock)
        .mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockQuizResponses)
            })
          })
        });

      (db.collection('gamification').doc(mockUserId).get as jest.Mock)
        .mockResolvedValue({
          exists: true,
          data: () => mockGamificationData
        });

      // Test getting personalized content
      const content = await personalizationService.getPersonalizedContent(mockUserId, 'both');

      // Verify preferences were created
      expect(db.collection('userPreferences').doc(mockUserId).set)
        .toHaveBeenCalled();

      // Verify content was returned
      expect(content).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock a database error
      (db.collection('userPreferences').doc(mockUserId).get as jest.Mock)
        .mockRejectedValue(new Error('Database error'));

      const content = await personalizationService.getPersonalizedContent(mockUserId, 'both');

      expect(content).toEqual([]);
    });
  });
}); 