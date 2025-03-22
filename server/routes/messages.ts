import { Router, Request } from 'express';
import { validateAuthToken, AuthRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { z } from 'zod';

const router = Router();

// Message validation schema
const MessageSchema = z.object({
  content: z.string(),
  iv: z.string(),
  timestamp: z.date(),
});

// Get messages between two users
router.get('/:userId/:partnerId', validateAuthToken, async (req: AuthRequest, res) => {
  try {
    const { userId, partnerId } = req.params;
    
    // Verify user has access to these messages
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to messages' });
    }

    const messagesRef = db.collection(`messages/${userId}/${partnerId}`);
    const snapshot = await messagesRef
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/:userId/:partnerId', validateAuthToken, async (req: AuthRequest, res) => {
  try {
    const { userId, partnerId } = req.params;
    const messageData = MessageSchema.parse({
      ...req.body,
      timestamp: new Date(),
    });

    // Verify user is sending their own message
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized message send' });
    }

    // Create message in both users' collections
    const batch = db.batch();
    
    const userMessageRef = db
      .collection(`messages/${userId}/${partnerId}`)
      .doc();
    
    const partnerMessageRef = db
      .collection(`messages/${partnerId}/${userId}`)
      .doc();

    const message = {
      ...messageData,
      senderId: userId,
    };

    batch.set(userMessageRef, message);
    batch.set(partnerMessageRef, message);

    await batch.commit();

    res.status(201).json({
      id: userMessageRef.id,
      ...message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a message
router.delete('/:userId/:partnerId/:messageId', validateAuthToken, async (req: AuthRequest, res) => {
  try {
    const { userId, partnerId, messageId } = req.params;

    // Verify user is deleting their own message
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized message deletion' });
    }

    // Delete message from both users' collections
    const batch = db.batch();
    
    const userMessageRef = db
      .collection(`messages/${userId}/${partnerId}`)
      .doc(messageId);
    
    const partnerMessageRef = db
      .collection(`messages/${partnerId}/${userId}`)
      .doc(messageId);

    batch.delete(userMessageRef);
    batch.delete(partnerMessageRef);

    await batch.commit();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router; 