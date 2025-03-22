import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import User from '../models/User';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;
let token: string;
let userId: string;

beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user
  const user = new User({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });
  await user.save();
  userId = user._id.toString();

  // Generate JWT token
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Quizzes API', () => {
  describe('GET /api/quizzes', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/quizzes');
      expect(response.status).toBe(401);
    });

    it('should return a list of quizzes', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/quizzes/test-quiz-id');
      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/quizzes/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Quiz not found');
    });
  });

  describe('POST /api/quizzes/response', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/quizzes/response')
        .send({
          quiz_id: 'test-quiz-id',
          answers: [{ selected_option: 'test answer' }]
        });

      expect(response.status).toBe(401);
    });

    it('should require quiz_id and answers', async () => {
      const response = await request(app)
        .post('/api/quizzes/response')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Quiz ID and answers array are required');
    });
  });
}); 