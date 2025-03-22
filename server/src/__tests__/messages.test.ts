import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../index';

// Mock Firebase Auth
jest.mock('firebase-admin/auth', () => {
  return {
    getAuth: jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com'
      })
    })
  };
});

// Mock Firebase Firestore
jest.mock('firebase-admin/firestore', () => {
  // Creating a document reference mock with necessary methods
  const createDocMock = () => ({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: 'user-123',
        displayName: 'Test User'
      }),
      id: 'user-123'
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined)
  });

  // Create a collection reference mock
  const createCollectionMock = () => ({
    doc: jest.fn().mockImplementation(() => createDocMock()),
    where: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'message-1',
            data: () => ({
              id: 'message-1',
              senderId: 'user-123',
              recipientId: 'user-456',
              content: 'Hello there',
              timestamp: new Date(),
              read: false
            })
          }
        ]
      })
    }),
    add: jest.fn().mockResolvedValue({ id: 'new-message-id' })
  });

  // Create a batch mock
  const createBatchMock = () => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined)
  });

  // Firebase transaction functions
  const createTransactionFunctions = {
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  return {
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockImplementation(() => createCollectionMock()),
      batch: jest.fn().mockImplementation(() => createBatchMock()),
      runTransaction: jest.fn((callback: any) => Promise.resolve(callback(createTransactionFunctions)))
    }),
    FieldValue: {
      increment: jest.fn((val: number) => val),
      serverTimestamp: jest.fn(() => new Date())
    }
  };
});

describe('Message API', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /api/messages/:userId/:partnerId', () => {
    it('should return 401 if not authenticated', async () => {
      // Override the mock for this specific test
      const getAuth = require('firebase-admin/auth').getAuth;
      getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Unauthorized'));
      
      const response = await request(app)
        .get('/api/messages/user-123/user-456')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if requesting messages for another user', async () => {
      const response = await request(app)
        .get('/api/messages/not-my-id/user-456')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(403);
    });

    it('should return messages between users', async () => {
      const response = await request(app)
        .get('/api/messages/user-123/user-456')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/messages/:userId/:partnerId', () => {
    it('should return 401 if not authenticated', async () => {
      // Override the mock for this specific test
      const getAuth = require('firebase-admin/auth').getAuth;
      getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Unauthorized'));
      
      const response = await request(app)
        .post('/api/messages/user-123/user-456')
        .set('Authorization', 'Bearer invalid-token')
        .send({ content: 'Test message' });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if sending a message for another user', async () => {
      const response = await request(app)
        .post('/api/messages/not-my-id/user-456')
        .set('Authorization', 'Bearer valid-token')
        .send({ content: 'Test message' });
      
      expect(response.status).toBe(403);
    });

    it('should return 400 if message content is missing', async () => {
      const response = await request(app)
        .post('/api/messages/user-123/user-456')
        .set('Authorization', 'Bearer valid-token')
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should create a new message', async () => {
      const response = await request(app)
        .post('/api/messages/user-123/user-456')
        .set('Authorization', 'Bearer valid-token')
        .send({ content: 'Test message', timestamp: new Date() });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('DELETE /api/messages/:userId/:partnerId/:messageId', () => {
    it('should return 401 if not authenticated', async () => {
      // Override the mock for this specific test
      const getAuth = require('firebase-admin/auth').getAuth;
      getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Unauthorized'));
      
      const response = await request(app)
        .delete('/api/messages/user-123/user-456/message-1')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if deleting a message for another user', async () => {
      const response = await request(app)
        .delete('/api/messages/not-my-id/user-456/message-1')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(403);
    });

    it('should return 404 if message does not exist', async () => {
      // Mock document that doesn't exist
      const firestore = require('firebase-admin/firestore').getFirestore();
      const docMock = {
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      };
      
      // Override collection mock for this test
      firestore.collection.mockReturnValueOnce({
        doc: jest.fn().mockReturnValue(docMock)
      });
      
      const response = await request(app)
        .delete('/api/messages/user-123/user-456/non-existent')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(404);
    });

    it('should delete the message', async () => {
      const response = await request(app)
        .delete('/api/messages/user-123/user-456/message-1')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/messages/:userId/conversations', () => {
    it('should return 401 if not authenticated', async () => {
      // Override the mock for this specific test
      const getAuth = require('firebase-admin/auth').getAuth;
      getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Unauthorized'));
      
      const response = await request(app)
        .get('/api/messages/user-123/conversations')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if requesting conversations for another user', async () => {
      const response = await request(app)
        .get('/api/messages/not-my-id/conversations')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(403);
    });

    it('should return conversations', async () => {
      // Mock conversations collection
      const firestore = require('firebase-admin/firestore').getFirestore();
      firestore.collection.mockReturnValueOnce({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: [
                {
                  id: 'user-456',
                  data: () => ({
                    lastMessage: 'Hello there',
                    lastMessageTime: new Date(),
                    unreadCount: 2,
                    partnerId: 'user-456'
                  })
                }
              ]
            })
          })
        })
      });
      
      const response = await request(app)
        .get('/api/messages/user-123/conversations')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/messages/:userId/:partnerId/read', () => {
    it('should return 401 if not authenticated', async () => {
      // Override the mock for this specific test
      const getAuth = require('firebase-admin/auth').getAuth;
      getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Unauthorized'));
      
      const response = await request(app)
        .put('/api/messages/user-123/user-456/read')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if marking messages as read for another user', async () => {
      const response = await request(app)
        .put('/api/messages/not-my-id/user-456/read')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(403);
    });

    it('should mark messages as read', async () => {
      const response = await request(app)
        .put('/api/messages/user-123/user-456/read')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });
  });
}); 