import * as admin from 'firebase-admin';
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
    async sendNotification(user, payload, fcmToken) {
        try {
            const message = {
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
        }
        catch (error) {
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                // Handle invalid or expired token
                // You might want to remove the token from the user's record
                throw new Error('Invalid FCM token');
            }
            throw error;
        }
    }
    async sendMulticastNotification(tokens, payload) {
        try {
            const message = {
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
        }
        catch (error) {
            throw error;
        }
    }
    async sendTopicNotification(topic, payload) {
        try {
            const message = {
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
        }
        catch (error) {
            throw error;
        }
    }
    async subscribeToTopic(tokens, topic) {
        try {
            await admin.messaging().subscribeToTopic(tokens, topic);
        }
        catch (error) {
            throw error;
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        try {
            await admin.messaging().unsubscribeFromTopic(tokens, topic);
        }
        catch (error) {
            throw error;
        }
    }
}
