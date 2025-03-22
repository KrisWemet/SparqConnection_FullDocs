import request from 'supertest';
import { app } from '../app';
import User from '../models/User';
import { generateToken } from '../utils/auth';
import mongoose from 'mongoose';

describe('Feature Access Tests', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });
    userId = user._id.toString();
    token = generateToken(user);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Expert Advice Access', () => {
    it('should allow access to expert advice without subscription', async () => {
      const response = await request(app)
        .get('/api/expert-advice')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Analytics Access', () => {
    it('should allow access to advanced analytics without subscription', async () => {
      const response = await request(app)
        .get('/api/analytics/advanced')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Quiz Access', () => {
    it('should allow access to all quizzes without subscription', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Prompt Access', () => {
    it('should allow access to all prompts without subscription', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
}); 