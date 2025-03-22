import request from 'supertest';
import { connect, disconnect } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as SocketIOClient } from 'socket.io-client';
import app from '../app';
import { UserModel as User } from '../models/User';
import { GamificationModel as Gamification } from '../models/Gamification';
import jwt from 'jsonwebtoken';
let mongoServer;
let token;
let userId;
let io;
let serverSocket;
let clientSocket;
let httpServer;
beforeAll(async () => {
    // Set up MongoDB Memory Server
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await connect(mongoUri);
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
    // Set up Socket.io server and client
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen();
    const port = httpServer.address().port;
    clientSocket = SocketIOClient(`http://localhost:${port}`, {
        auth: { userId },
        withCredentials: true
    });
    io.on('connection', (socket) => {
        serverSocket = socket;
    });
    await new Promise((resolve) => {
        clientSocket.on('connect', resolve);
    });
});
afterAll(async () => {
    await disconnect();
    await mongoServer.stop();
    await new Promise((resolve) => {
        clientSocket.close();
        resolve();
    });
    await new Promise((resolve) => {
        httpServer.close();
        resolve();
    });
});
describe('Gamification Real-time Updates', () => {
    test('should emit gamificationUpdate event when points are updated', async () => {
        // Create initial gamification stats
        const stats = new Gamification({
            user: userId,
            points: 100,
            current_streak: 1,
            longest_streak: 1
        });
        await stats.save();
        // Set up event listener for gamificationUpdate
        const updatePromise = new Promise((resolve) => {
            clientSocket.on('gamificationUpdate', (data) => {
                expect(data.points).toBe(150);
                resolve();
            });
        });
        // Make request to update points
        await request(app)
            .post('/api/gamification/points')
            .set('Authorization', `Bearer ${token}`)
            .send({ points: 50, source: 'quiz_completion' })
            .expect(200);
        // Wait for the event
        await updatePromise;
    });
    test('should emit gamificationUpdate event when streak is updated', async () => {
        // Set up event listener for gamificationUpdate
        const updatePromise = new Promise((resolve) => {
            clientSocket.on('gamificationUpdate', (data) => {
                expect(data.current_streak).toBe(2);
                expect(data.longest_streak).toBe(2);
                resolve();
            });
        });
        // Make request to update streak
        await request(app)
            .post('/api/gamification/streak')
            .set('Authorization', `Bearer ${token}`)
            .send({ streak: 2 })
            .expect(200);
        // Wait for the event
        await updatePromise;
    });
    test('should only emit events to the correct user', async () => {
        // Create another user and socket connection
        const otherUser = new User({
            email: 'other@example.com',
            password: 'password123',
            firstName: 'Other',
            lastName: 'User'
        });
        await otherUser.save();
        const otherSocket = SocketIOClient(`http://localhost:${httpServer.address().port}`, {
            auth: { userId: otherUser._id.toString() },
            withCredentials: true
        });
        // Set up event listeners for both sockets
        const originalUserPromise = new Promise((resolve) => {
            clientSocket.on('gamificationUpdate', (data) => {
                expect(data.points).toBe(200);
                resolve();
            });
        });
        const otherUserPromise = new Promise((resolve, reject) => {
            otherSocket.on('gamificationUpdate', () => {
                reject(new Error('Other user should not receive updates'));
            });
            setTimeout(resolve, 1000);
        });
        // Make request to update points for original user
        await request(app)
            .post('/api/gamification/points')
            .set('Authorization', `Bearer ${token}`)
            .send({ points: 50, source: 'quiz_completion' })
            .expect(200);
        // Wait for both promises
        await Promise.all([originalUserPromise, otherUserPromise]);
        otherSocket.close();
    });
});
