import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendNotification, sendTopicNotification, subscribeTopic, unsubscribeTopic } from '../controllers/notificationController';
const router = express.Router();
// Protected routes
router.post('/send', authenticateToken, sendNotification);
router.post('/topic/send', authenticateToken, sendTopicNotification);
router.post('/topic/subscribe', authenticateToken, subscribeTopic);
router.post('/topic/unsubscribe', authenticateToken, unsubscribeTopic);
export default router;
