import { Request, Response } from 'express';
import { admin } from '../../config/firebase';
import type { DeepMockProxy } from 'jest-mock-extended';
import { mockDeep } from 'jest-mock-extended';

// Mock Firebase Admin
jest.mock('../../config/firebase', () => ({
  admin: {
    firestore: jest.fn(() => ({
      collection: jest.fn(),
      runTransaction: jest.fn(),
    })),
  },
}));

describe('Prompt Routes', () => {
  let req: DeepMockProxy<Request>;
  let res: DeepMockProxy<Response>;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request and response
    req = mockDeep<Request>();
    res = mockDeep<Response>();

    // Setup Firebase mocks
    mockGet = jest.fn();
    mockDoc = jest.fn(() => ({ get: mockGet }));
    mockWhere = jest.fn(() => ({ get: mockGet, orderBy: mockOrderBy }));
    mockOrderBy = jest.fn(() => ({ get: mockGet, limit: mockLimit }));
    mockLimit = jest.fn(() => ({ get: mockGet }));
    mockCollection = jest.fn(() => ({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockGet,
    }));

    ((admin.firestore as unknown) as jest.Mock).mockReturnValue({
      collection: mockCollection,
    });
  });

  describe('GET /prompts', () => {
    const mockPrompts = [
      {
        id: 'prompt1',
        text: 'Share a recent moment when your partner made you feel valued',
        category: 'appreciation',
        description: 'Express gratitude for meaningful moments',
        suggestedDuration: 10,
        difficulty: 'beginner',
        data: () => ({
          text: 'Share a recent moment when your partner made you feel valued',
          category: 'appreciation',
          description: 'Express gratitude for meaningful moments',
          suggestedDuration: 10,
          difficulty: 'beginner',
        }),
      },
      {
        id: 'prompt2',
        text: 'What are your hopes and dreams for our relationship?',
        category: 'deep-connection',
        description: 'Explore relationship aspirations',
        suggestedDuration: 15,
        difficulty: 'intermediate',
        data: () => ({
          text: 'What are your hopes and dreams for our relationship?',
          category: 'deep-connection',
          description: 'Explore relationship aspirations',
          suggestedDuration: 15,
          difficulty: 'intermediate',
        }),
      },
    ];

    it('should return all prompts', async () => {
      mockGet.mockResolvedValueOnce({ docs: mockPrompts });

      await require('../prompts').default.get(req, res);

      expect(mockCollection).toHaveBeenCalledWith('prompts');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(res.json).toHaveBeenCalledWith({
        prompts: expect.arrayContaining([
          expect.objectContaining({
            id: 'prompt1',
            text: 'Share a recent moment when your partner made you feel valued',
          }),
          expect.objectContaining({
            id: 'prompt2',
            text: 'What are your hopes and dreams for our relationship?',
          }),
        ]),
      });
    });

    it('should handle errors when fetching prompts', async () => {
      const error = new Error('Database error');
      mockGet.mockRejectedValueOnce(error);

      await require('../prompts').default.get(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error fetching prompts',
      });
    });
  });

  describe('GET /prompts/:id', () => {
    const mockPrompt = {
      id: 'prompt1',
      data: () => ({
        text: 'Share a recent moment when your partner made you feel valued',
        category: 'appreciation',
        description: 'Express gratitude for meaningful moments',
        suggestedDuration: 10,
        difficulty: 'beginner',
      }),
    };

    it('should return a specific prompt', async () => {
      req.params = { id: 'prompt1' };
      mockGet.mockResolvedValueOnce({ exists: true, ...mockPrompt });

      await require('../prompts').default.getById(req, res);

      expect(mockCollection).toHaveBeenCalledWith('prompts');
      expect(mockDoc).toHaveBeenCalledWith('prompt1');
      expect(res.json).toHaveBeenCalledWith({
        prompt: expect.objectContaining({
          id: 'prompt1',
          text: 'Share a recent moment when your partner made you feel valued',
        }),
      });
    });

    it('should return 404 for non-existent prompt', async () => {
      req.params = { id: 'nonexistent' };
      mockGet.mockResolvedValueOnce({ exists: false });

      await require('../prompts').default.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Prompt not found',
      });
    });
  });

  describe('GET /prompts/category/:category', () => {
    const mockPrompts = [
      {
        id: 'prompt1',
        data: () => ({
          text: 'Share a recent moment when your partner made you feel valued',
          category: 'appreciation',
        }),
      },
    ];

    it('should return prompts by category', async () => {
      req.params = { category: 'appreciation' };
      mockGet.mockResolvedValueOnce({ docs: mockPrompts });

      await require('../prompts').default.getByCategory(req, res);

      expect(mockCollection).toHaveBeenCalledWith('prompts');
      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'appreciation');
      expect(res.json).toHaveBeenCalledWith({
        prompts: expect.arrayContaining([
          expect.objectContaining({
            id: 'prompt1',
            text: 'Share a recent moment when your partner made you feel valued',
          }),
        ]),
      });
    });

    it('should return empty array for category with no prompts', async () => {
      req.params = { category: 'nonexistent' };
      mockGet.mockResolvedValueOnce({ docs: [] });

      await require('../prompts').default.getByCategory(req, res);

      expect(res.json).toHaveBeenCalledWith({ prompts: [] });
    });
  });

  describe('GET /prompts/popular', () => {
    const mockPopularPrompts = [
      {
        id: 'prompt1',
        data: () => ({
          text: 'Share a recent moment when your partner made you feel valued',
          responseCount: 100,
        }),
      },
    ];

    it('should return popular prompts', async () => {
      mockGet.mockResolvedValueOnce({ docs: mockPopularPrompts });

      await require('../prompts').default.getPopular(req, res);

      expect(mockCollection).toHaveBeenCalledWith('prompts');
      expect(mockOrderBy).toHaveBeenCalledWith('responseCount', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        prompts: expect.arrayContaining([
          expect.objectContaining({
            id: 'prompt1',
            text: 'Share a recent moment when your partner made you feel valued',
          }),
        ]),
      });
    });

    it('should handle errors when fetching popular prompts', async () => {
      const error = new Error('Database error');
      mockGet.mockRejectedValueOnce(error);

      await require('../prompts').default.getPopular(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error fetching popular prompts',
      });
    });
  });
}); 