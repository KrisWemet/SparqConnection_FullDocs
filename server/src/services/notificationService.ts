import * as admin from 'firebase-admin';
import { IUser } from '../models/User';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export class NotificationService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
    }
  }

  async sendNotification(
    user: IUser,
    payload: NotificationPayload,
    fcmToken: string
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: payload.data,
        token: fcmToken
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error: any) {
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        // Handle invalid or expired token
        // You might want to remove the token from the user's record
        throw new Error('Invalid FCM token');
      }
      throw error;
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: payload.data,
        tokens: tokens
      };

      const response = await admin.messaging().sendMulticast(message);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendTopicNotification(
    topic: string,
    payload: NotificationPayload
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: payload.data,
        topic: topic
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
    } catch (error) {
      throw error;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
    } catch (error) {
      throw error;
    }
  }
} 