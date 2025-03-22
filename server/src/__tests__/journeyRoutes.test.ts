import request from 'supertest';
import app from '../app';
import type { Firestore } from '@google-cloud/firestore';
import { mockFirestore } from '../__mocks__/firebaseMock';
import { authenticateToken } from '../__mocks__/auth';

jest.mock('../middleware/auth', () => ({
  authenticateToken
}));

interface Journey {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: string;
  prerequisites: string[];
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'prompt' | 'video' | 'article';
  content: {
    url?: string;
    questions?: QuizQuestion[];
    promptText?: string;
  };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface UserProgress {
  userId: string;
  journeyId: string;
  completedSteps: string[];
  currentStep: string;
  startedAt: string;
  lastUpdated: string;
}

jest.mock('../config/firebase', () => ({
  db: mockFirestore
}));

jest.mock('../utils/auth', () => ({
  auth: jest.fn()
}));

const mockJourney: Journey = {
  id: 'journey1',
  title: 'Test Journey',
  description: 'A test journey',
  steps: [
    {
      id: 'step1',
      title: 'Step 1',
      description: 'First step',
      type: 'quiz',
      content: {
        questions: [
          {
            question: 'Test question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          }
        ]
      }
    },
    {
      id: 'step2',
      title: 'Step 2',
      description: 'Second step',
      type: 'video',
      content: {
        url: 'https://example.com/video'
      }
    }
  ],
  difficulty: 'beginner',
  category: 'test',
  estimatedTime: '1 hour',
  prerequisites: []
};

const mockProgress: UserProgress = {
  userId: 'user1',
  journeyId: 'journey1',
  completedSteps: ['step1'],
  currentStep: 'step2',
  startedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
};

describe('Journey Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user1' };
      next();
    });
  });

  describe('GET /api/journeys', () => {
    it('should return all journeys', async () => {
      mockFirestore.collection('journeys').get.mockResolvedValueOnce({
        docs: [
          {
            id: mockJourney.id,
            data: () => mockJourney
          }
        ]
      });

      const response = await request(app)
        .get('/api/journeys')
        .expect(200);

      expect(response.body).toEqual([mockJourney]);
      expect(mockFirestore.collection).toHaveBeenCalledWith('journeys');
    });

    it('should handle errors', async () => {
      mockFirestore.collection('journeys').get.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .get('/api/journeys')
        .expect(500);
    });
  });

  describe('GET /api/journeys/:id', () => {
    it('should return a journey with progress', async () => {
      mockFirestore.collection('journeys').doc(mockJourney.id).get.mockResolvedValueOnce({
        exists: true,
        id: mockJourney.id,
        data: () => mockJourney
      });

      mockFirestore.collection('progress').where('userId', '==', 'user1')
        .where('journeyId', '==', mockJourney.id).get.mockResolvedValueOnce({
          docs: [
            {
              id: 'progress1',
              data: () => mockProgress
            }
          ]
        });

      const response = await request(app)
        .get(`/api/journeys/${mockJourney.id}`)
        .expect(200);

      expect(response.body).toEqual({
        ...mockJourney,
        progress: mockProgress
      });
    });

    it('should return 404 for non-existent journey', async () => {
      mockFirestore.collection('journeys').doc('nonexistent').get.mockResolvedValueOnce({
        exists: false
      });

      await request(app)
        .get('/api/journeys/nonexistent')
        .expect(404);
    });
  });

  describe('POST /api/journeys/:id/start', () => {
    it('should start a new journey', async () => {
      mockFirestore.collection('journeys').doc(mockJourney.id).get.mockResolvedValueOnce({
        exists: true,
        id: mockJourney.id,
        data: () => mockJourney
      });

      mockFirestore.collection('progress').add.mockResolvedValueOnce({
        id: 'progress1'
      });

      const response = await request(app)
        .post(`/api/journeys/${mockJourney.id}/start`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Journey started successfully');
      expect(mockFirestore.collection('progress').add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          journeyId: mockJourney.id,
          completedSteps: [],
          currentStep: mockJourney.steps[0].id
        })
      );
    });

    it('should return 404 for non-existent journey', async () => {
      mockFirestore.collection('journeys').doc('nonexistent').get.mockResolvedValueOnce({
        exists: false
      });

      await request(app)
        .post('/api/journeys/nonexistent/start')
        .expect(404);
    });
  });

  describe('PUT /api/journeys/:id/progress', () => {
    it('should update journey progress', async () => {
      const updatedProgress = {
        ...mockProgress,
        completedSteps: ['step1', 'step2'],
        currentStep: 'step3',
        lastUpdated: expect.any(String)
      };

      mockFirestore.collection('progress').where('userId', '==', 'user1')
        .where('journeyId', '==', mockJourney.id).get.mockResolvedValueOnce({
          docs: [
            {
              id: 'progress1',
              ref: {
                update: jest.fn().mockResolvedValueOnce(undefined)
              },
              data: () => mockProgress
            }
          ]
        });

      const response = await request(app)
        .put(`/api/journeys/${mockJourney.id}/progress`)
        .send({
          completedSteps: ['step1', 'step2'],
          currentStep: 'step3'
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Progress updated successfully'
      });
    });

    it('should return 404 if progress not found', async () => {
      mockFirestore.collection('progress').where('userId', '==', 'user1')
        .where('journeyId', '==', mockJourney.id).get.mockResolvedValueOnce({
          docs: []
        });

      await request(app)
        .put(`/api/journeys/${mockJourney.id}/progress`)
        .send({
          completedSteps: ['step1', 'step2'],
          currentStep: 'step3'
        })
        .expect(404);
    });
  });
}); 