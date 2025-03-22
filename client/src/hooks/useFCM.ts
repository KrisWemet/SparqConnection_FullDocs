import { useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../firebase';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const useFCM = () => {
  useEffect(() => {
    const messaging = getMessaging(app);
    
    // Request permission and get token
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
          });
          // Store token in user profile or send to server
          console.log('FCM Token:', token);
        }
      } catch (err) {
        console.error('Failed to get FCM token:', err);
      }
    };

    requestPermission();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      // Display notification using the Notifications API
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Message', {
          body: payload.notification?.body,
          data: payload.data
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const sendNotification = useCallback(async (userId: string, notification: NotificationPayload) => {
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          notification
        })
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }, []);

  return { sendNotification };
}; 