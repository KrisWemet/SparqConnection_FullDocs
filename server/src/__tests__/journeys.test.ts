import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { getJourneys, getJourneyById, updateJourneyProgress } from '../controllers/journeyController';

// Mock Firestore
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('Journey Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockUser: { _id: string };

  beforeEach(() => {
    mockUser = { _id: 'testUserId' };
    mockReq = {
      user: mockUser,
      params: {},
      body: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /journeys', () => {
    const mockJourneys = [
      {
        id: 'journey1',
        title: '5 Love Languages',
        description: 'Discover your love language',
        duration: 5,
        category: 'Communication',
      },
      {
        id: 'journey2',
        title: 'Building Trust',
        description: 'Strengthen your bond',
        duration: 7,
        category: 'Trust',
      },
    ];

    it('should return all available journeys', async () => {
      const mockSnapshot = {
        docs: mockJourneys.map(journey => ({
          id: journey.id,
          data: () => journey,
        })),
      };

      const mockCollection = jest.fn().mockReturnThis();
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot);

      (db.collection as jest.Mock).mockReturnValue({
        get: mockGet,
      });

      await getJourneys(mockReq as Request, mockRes as Response);

      expect(db.collection).toHaveBeenCalledWith('journeys');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockJourneys,
      });
    });

    it('should handle errors when fetching journeys', async () => {
      const mockError = new Error('Database error');
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      });

      await getJourneys(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching journeys',
      });
    });
  });

  describe('GET /journeys/:id', () => {
    const mockJourney = {
      id: 'journey1',
      title: '5 Love Languages',
      description: 'Discover your love language',
      duration: 5,
      days: [
        {
          day: 1,
          title: 'Words of Affirmation',
          content: 'Express love through words',
          activities: ['Write a love letter', 'Give 3 compliments'],
        },
      ],
    };

    it('should return journey details with user progress', async () => {
      const mockJourneyDoc = {
        exists: true,
        id: mockJourney.id,
        data: () => mockJourney,
      };

      const mockProgressDoc = {
        exists: true,
        data: () => ({
          currentDay: 2,
          reflections: {
            '1': {
              completed: true,
              reflection: 'Great experience',
              timestamp: new Date(),
            },
          },
        }),
      };

      (db.collection as jest.Mock)
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockJourneyDoc),
          }),
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockProgressDoc),
          }),
        });

      mockReq.params = { id: 'journey1' };

      await getJourneyById(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockJourney,
          progress: {
            currentDay: 2,
            reflections: expect.any(Object),
          },
        },
      });
    });

    it('should handle non-existent journey', async () => {
      const mockJourneyDoc = {
        exists: false,
      };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockJourneyDoc),
        }),
      });

      mockReq.params = { id: 'nonexistent' };

      await getJourneyById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Journey not found',
      });
    });
  });

  describe('POST /journeyProgress', () => {
    const mockProgress = {
      journeyId: 'journey1',
      day: 1,
      reflection: 'Today I learned about expressing love through words.',
    };

    it('should update journey progress successfully', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          currentDay: 1,
          reflections: {},
        }),
        ref: {
          update: jest.fn().mockResolvedValue(true),
        },
      };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      mockReq.body = mockProgress;

      await updateJourneyProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Progress updated successfully',
      });
    });

    it('should handle invalid day number', async () => {
      mockReq.body = {
        ...mockProgress,
        day: 0,
      };

      await updateJourneyProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid day number',
      });
    });

    it('should handle missing reflection', async () => {
      mockReq.body = {
        ...mockProgress,
        reflection: '',
      };

      await updateJourneyProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Reflection is required',
      });
    });
  });
}); 