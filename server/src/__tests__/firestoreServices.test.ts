import { jest, describe, it, beforeAll, beforeEach, afterAll, expect } from '@jest/globals';
import {
  userService,
  gamificationService,
  forumService,
  responseService,
  IUser,
  IGamification,
  IForumPost,
  IForumComment,
  IPromptResponse,
  IQuizResponse
} from '../services/firestoreService';

// Mock Firebase Admin
jest.mock('../config/firebase', () => ({
  __esModule: true,
  default: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          id: 'test-doc-1',
          data: () => ({
            // User data
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
            notificationPreferences: {
              dailyPrompts: true,
              quizzes: true,
              achievements: true
            },
            createdAt: new Date(),
            updatedAt: new Date()
          })
        })),
        update: jest.fn(() => Promise.resolve())
      })),
      add: jest.fn(() => Promise.resolve({ id: 'test-doc-1' })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            empty: false,
            docs: [{
              id: 'test-doc-1',
              data: () => ({
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
              })
            }]
          }))
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            docs: [{
              id: 'test-doc-1',
              data: () => ({
                content: 'Test content',
                createdAt: new Date()
              })
            }]
          }))
        }))
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          docs: [{
            id: 'test-doc-1',
            data: () => ({
              content: 'Test content',
              createdAt: new Date()
            })
          }]
        }))
      }))
    }))
  }
}));

describe('Firestore Services', () => {
  describe('userService', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
        isModerator: false,
        isAdmin: false,
        lastLogin: new Date(),
        notificationPreferences: {
          dailyPrompts: true,
          quizzes: true,
          achievements: true
        }
      };

      const user = await userService.createUser(userData);
      expect(user).toBeDefined();
      expect(user.id).toBe('test-doc-1');
      expect(user.email).toBe(userData.email);
    });

    it('should get user by email', async () => {
      const user = await userService.getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });
  });

  describe('gamificationService', () => {
    it('should get user gamification data', async () => {
      const gamification = await gamificationService.getGamification('test-user-1');
      expect(gamification).toBeDefined();
      expect(gamification?.id).toBe('test-doc-1');
    });

    it('should update gamification data', async () => {
      await expect(gamificationService.updateGamification('test-user-1', {
        points: 100,
        current_streak: 5
      })).resolves.not.toThrow();
    });
  });

  describe('forumService', () => {
    it('should create a forum post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
        authorId: 'test-user-1',
        category: 'General' as const,
        tags: ['test'],
        likes: [],
        isModerated: false,
        isFlagged: false
      };

      const post = await forumService.createPost(postData);
      expect(post).toBeDefined();
      expect(post.id).toBe('test-doc-1');
      expect(post.title).toBe(postData.title);
    });

    it('should get post comments', async () => {
      const comments = await forumService.getPostComments('test-post-1');
      expect(comments).toBeDefined();
      expect(comments.length).toBeGreaterThan(0);
    });
  });

  describe('responseService', () => {
    it('should create a prompt response', async () => {
      const responseData = {
        userId: 'test-user-1',
        promptId: 'test-prompt-1',
        response: 'Test response'
      };

      const response = await responseService.createPromptResponse(responseData);
      expect(response).toBeDefined();
      expect(response.id).toBe('test-doc-1');
      expect(response.response).toBe(responseData.response);
    });

    it('should get user prompt responses', async () => {
      const responses = await responseService.getUserPromptResponses('test-user-1');
      expect(responses).toBeDefined();
      expect(responses.length).toBeGreaterThan(0);
    });
  });
}); 