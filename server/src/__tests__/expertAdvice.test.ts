/// <reference types="jest" />
import { jest, describe, it, beforeAll, beforeEach, afterAll, expect } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import Gamification from '../models/Gamification';
import User from '../models/User';
import jwt from 'jsonwebtoken';

jest.mock('@sanity/client', () => ({
  createClient: jest.fn(() => ({
    fetch: jest.fn(async (query: string, params?: any) => {
      if (params?.id === 'test-tip-1') {
        return {
          _id: 'test-tip-1',
          title: 'Test Tip 1',
          content: [],
          points_required: 50,
          category: 'Communication',
          expert: {
            name: 'Dr. Test',
            credentials: 'PhD in Testing'
          }
        };
      }
      return [
        {
          _id: 'test-tip-1',
          title: 'Test Tip 1',
          content: [],
          points_required: 50,
          category: 'Communication',
          expert: {
            name: 'Dr. Test',
            credentials: 'PhD in Testing'
          }
        },
        {
          _id: 'test-tip-2',
          title: 'Test Tip 2',
          content: [],
          points_required: 100,
          category: 'Trust',
          expert: {
            name: 'Dr. Test 2',
            credentials: 'PhD in Testing 2'
          }
        }
      ];
    })
  }))
}));

describe('Expert Advice Endpoints', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();

    // Create test user
    testUser = await User.create({
      email: 'test@test.com',
      password: 'password123'
    });

    // Create gamification data
    await Gamification.create({
      user: testUser._id,
      points: 75,
      badges: []
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/expert-advice', () => {
    it('should return all expert advice with unlock status', async () => {
      const response = await request(app)
        .get('/api/expert-advice')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user_points', 75);
      expect(response.body).toHaveProperty('tips_by_category');
      expect(response.body.tips_by_category).toHaveProperty('Communication');
      expect(response.body.tips_by_category).toHaveProperty('Trust');

      const communicationTip = response.body.tips_by_category.Communication[0];
      expect(communicationTip.is_unlocked).toBe(true);
      expect(communicationTip.points_needed).toBe(0);

      const trustTip = response.body.tips_by_category.Trust[0];
      expect(trustTip.is_unlocked).toBe(false);
      expect(trustTip.points_needed).toBe(25);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/expert-advice');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/expert-advice/:id', () => {
    it('should return specific tip if user has enough points', async () => {
      const response = await request(app)
        .get('/api/expert-advice/test-tip-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', 'test-tip-1');
      expect(response.body).toHaveProperty('is_unlocked', true);
    });

    it('should return 403 if user does not have enough points', async () => {
      // Update user points to be lower
      await Gamification.findOneAndUpdate(
        { user: testUser._id },
        { points: 25 }
      );

      const response = await request(app)
        .get('/api/expert-advice/test-tip-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('points_needed', 25);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/expert-advice/test-tip-1');

      expect(response.status).toBe(401);
    });
  });
}); 