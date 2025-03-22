import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import User from '../models/User';
import jwt from 'jsonwebtoken';
let mongoServer;
let token;
let userId;
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
describe('Prompts API', () => {
    describe('GET /api/prompts/today', () => {
        it('should require authentication', async () => {
            const response = await request(app).get('/api/prompts/today');
            expect(response.status).toBe(401);
        });
        it('should return a daily prompt', async () => {
            const response = await request(app)
                .get('/api/prompts/today')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('prompt_id');
            expect(response.body).toHaveProperty('prompt_text');
            expect(response.body).toHaveProperty('category');
        });
    });
    describe('POST /api/prompts/response', () => {
        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/prompts/response')
                .send({
                prompt_id: 'test-prompt-id',
                response_text: 'Test response'
            });
            expect(response.status).toBe(401);
        });
        it('should create a prompt response', async () => {
            // First get a prompt
            const promptResponse = await request(app)
                .get('/api/prompts/today')
                .set('Authorization', `Bearer ${token}`);
            const prompt = promptResponse.body;
            // Then submit a response
            const response = await request(app)
                .post('/api/prompts/response')
                .set('Authorization', `Bearer ${token}`)
                .send({
                prompt_id: prompt.prompt_id,
                response_text: 'This is a test response',
                mood_score: 4
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('response_id');
            expect(response.body).toHaveProperty('message', 'Response saved successfully');
        });
        it('should require prompt_id and response_text', async () => {
            const response = await request(app)
                .post('/api/prompts/response')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Prompt ID and response text are required');
        });
    });
});
