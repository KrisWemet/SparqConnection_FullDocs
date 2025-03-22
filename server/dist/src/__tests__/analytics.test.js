import request from 'supertest';
import { mockFirestore } from '../__mocks__/firebaseMock';
import app from '../app';
import { userService } from '../models/User';
// Mock Firebase
jest.mock('../config/firebase', () => ({
    db: mockFirestore
}));
// Mock Firebase Auth
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'testUserId' })
    })
}));
let token;
let userId;
beforeAll(async () => {
    // Create a test user
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isModerator: false,
        isAdmin: false,
        lastLogin: new Date(),
        role: 'user',
        notificationPreferences: {
            dailyPrompts: true,
            quizzes: true,
            achievements: true
        }
    };
    // Mock user creation in Firestore
    mockFirestore.collection('users').add.mockResolvedValueOnce({
        id: 'testUserId',
        data: () => testUser
    });
    const user = await userService.createUser(testUser);
    userId = user.id;
    // Generate mock Firebase token
    token = 'mock-firebase-token';
    // Mock gamification data
    mockFirestore.collection('gamification').add.mockResolvedValueOnce({
        id: 'gamificationId',
        data: () => ({
            userId,
            points: 100,
            current_streak: 5,
            longest_streak: 7,
            badges: ['first_login', 'first_quiz'],
            level: 2,
            xp: 150
        })
    });
    // Mock prompt responses
    const promptResponses = [
        {
            userId,
            promptId: 'prompt1',
            response: 'Test response 1',
            sentiment: 'positive',
            createdAt: new Date('2023-04-01')
        },
        {
            userId,
            promptId: 'prompt2',
            response: 'Test response 2',
            sentiment: 'neutral',
            createdAt: new Date('2023-04-02')
        },
        {
            userId,
            promptId: 'prompt3',
            response: 'Test response 3',
            sentiment: 'negative',
            createdAt: new Date('2023-04-03')
        }
    ];
    mockFirestore.collection('promptResponses').get.mockResolvedValue({
        docs: promptResponses.map((response, index) => ({
            id: `response${index + 1}`,
            data: () => response
        }))
    });
});
describe('Analytics Routes', () => {
    describe('GET /api/analytics/heatmap', () => {
        it('should return response heatmap data for authenticated user', async () => {
            mockFirestore.collection('promptResponses')
                .where('userId', '==', userId)
                .get.mockResolvedValueOnce({
                docs: [
                    {
                        id: 'response1',
                        data: () => ({
                            createdAt: new Date('2023-04-01T10:00:00Z')
                        })
                    }
                ]
            });
            const response = await request(app)
                .get('/api/analytics/heatmap')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
        it('should return 401 for unauthenticated request', async () => {
            await request(app)
                .get('/api/analytics/heatmap')
                .expect(401);
        });
    });
    describe('GET /api/analytics/badges', () => {
        it('should return badge distribution data', async () => {
            mockFirestore.collection('gamification')
                .where('userId', '==', userId)
                .get.mockResolvedValueOnce({
                docs: [
                    {
                        id: 'gamificationId',
                        data: () => ({
                            badges: ['first_login', 'first_quiz']
                        })
                    }
                ]
            });
            const response = await request(app)
                .get('/api/analytics/badges')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });
    describe('GET /api/analytics/engagement', () => {
        it('should return engagement metrics', async () => {
            mockFirestore.collection('promptResponses')
                .where('userId', '==', userId)
                .get.mockResolvedValueOnce({
                docs: [
                    {
                        id: 'response1',
                        data: () => ({
                            response: 'Test response',
                            sentiment: 'positive',
                            createdAt: new Date('2023-04-01')
                        })
                    }
                ]
            });
            const response = await request(app)
                .get('/api/analytics/engagement')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('totalResponses');
            expect(response.body.data).toHaveProperty('averageResponseLength');
            expect(response.body.data).toHaveProperty('sentimentDistribution');
        });
    });
});
