import { Request, Response } from 'express';
import { NotificationService, NotificationPayload } from '../services/notificationService';
import User from '../models/User';

const notificationService = new NotificationService();

export const sendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, body, data, imageUrl } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      res.status(404).json({
        success: false,
        message: 'User not found or FCM token not registered'
      });
      return;
    }

    const payload: NotificationPayload = {
      title,
      body,
      data,
      imageUrl
    };

    await notificationService.sendNotification(user, payload, user.fcmToken);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification'
    });
  }
};

export const sendTopicNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, title, body, data, imageUrl } = req.body;

    const payload: NotificationPayload = {
      title,
      body,
      data,
      imageUrl
    };

    await notificationService.sendTopicNotification(topic, payload);

    res.json({
      success: true,
      message: 'Topic notification sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending topic notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending topic notification'
    });
  }
};

export const subscribeTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user?.fcmToken) {
      res.status(404).json({
        success: false,
        message: 'User not found or FCM token not registered'
      });
      return;
    }

    await notificationService.subscribeToTopic([user.fcmToken], topic);

    res.json({
      success: true,
      message: 'Successfully subscribed to topic'
    });
  } catch (error: any) {
    console.error('Error subscribing to topic:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error subscribing to topic'
    });
  }
};

export const unsubscribeTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user?.fcmToken) {
      res.status(404).json({
        success: false,
        message: 'User not found or FCM token not registered'
      });
      return;
    }

    await notificationService.unsubscribeFromTopic([user.fcmToken], topic);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from topic'
    });
  } catch (error: any) {
    console.error('Error unsubscribing from topic:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error unsubscribing from topic'
    });
  }
}; 