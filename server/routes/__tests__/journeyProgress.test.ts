import { Request, Response } from 'express';
import { startJourney, updateJourneyProgress } from '../../controllers/journeyController';
import { db } from '../../config/firebase';
import { mockRequest, mockResponse } from 'jest-mock-express';

jest.mock('../../config/firebase');
jest.mock('../../middleware/auth');

describe('Journey Progress Routes', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('startJourney', () => {
    it('should start a new journey successfully', async () => {
      const journeyId = 'test-journey-1';
      req.body = { journeyId };
      req.user = { id: 'test-user-1' };

      const mockJourney = {
        id: journeyId,
        title: 'Test Journey',
        duration: 5,
        days: Array(5).fill({ title: 'Test Day', content: 'Test Content' }),
      };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockJourney,
          }),
        }),
      });

      await startJourney(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Journey started successfully',
      });
    });

    it('should handle non-existent journey', async () => {
      req.body = { journeyId: 'non-existent' };
      req.user = { id: 'test-user-1' };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
        }),
      });

      await startJourney(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Journey not found',
      });
    });
  });

  describe('updateJourneyProgress', () => {
    const mockJourneyProgress = {
      journeyId: 'test-journey-1',
      currentDay: 1,
      reflection: 'encrypted-reflection',
      iv: 'test-iv',
    };

    it('should update progress and sync with partner successfully', async () => {
      req.body = mockJourneyProgress;
      req.user = { id: 'test-user-1' };

      const mockPartnerData = {
        partnerId: 'test-partner-1',
        currentDay: 1,
      };

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn(),
      };

      (db.batch as jest.Mock).mockReturnValue(mockBatch);
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ ...mockJourneyProgress, ...mockPartnerData }),
          }),
          update: jest.fn(),
        }),
      });

      await updateJourneyProgress(req, res);

      expect(mockBatch.update).toHaveBeenCalledTimes(2); // Updates both user and partner
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Progress updated successfully',
      });
    });

    it('should handle partner sync failure gracefully', async () => {
      req.body = mockJourneyProgress;
      req.user = { id: 'test-user-1' };

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error('Sync failed')),
      };

      (db.batch as jest.Mock).mockReturnValue(mockBatch);
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ ...mockJourneyProgress, partnerId: 'test-partner-1' }),
          }),
        }),
      });

      await updateJourneyProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to update progress',
      });
    });

    it('should handle missing partner gracefully', async () => {
      req.body = mockJourneyProgress;
      req.user = { id: 'test-user-1' };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ ...mockJourneyProgress }), // No partner data
          }),
          update: jest.fn(),
        }),
      });

      await updateJourneyProgress(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Progress updated successfully',
      });
    });

    it('should validate required fields', async () => {
      req.body = { journeyId: 'test-journey-1' }; // Missing required fields
      req.user = { id: 'test-user-1' };

      await updateJourneyProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
      });
    });

    it('should handle concurrent updates correctly', async () => {
      req.body = mockJourneyProgress;
      req.user = { id: 'test-user-1' };

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn(),
      };

      let callCount = 0;
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              throw new Error('Document updated by another client');
            }
            return {
              exists: true,
              data: () => ({ ...mockJourneyProgress, partnerId: 'test-partner-1' }),
            };
          }),
          update: jest.fn(),
        }),
      });
      (db.batch as jest.Mock).mockReturnValue(mockBatch);

      await updateJourneyProgress(req, res);

      expect(mockBatch.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Progress updated successfully',
      });
    });
  });
}); 