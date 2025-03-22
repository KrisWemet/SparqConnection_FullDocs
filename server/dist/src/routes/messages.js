import { Router } from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
const router = Router();
// Message schema using zod for validation
const MessageSchema = z.object({
    content: z.string().min(1, 'Message content is required'),
    timestamp: z.instanceof(Timestamp).or(z.date()).optional(),
    isEncrypted: z.boolean().optional(),
    encryptionInfo: z.object({
        iv: z.string(),
        encryptedSessionKey: z.string()
    }).optional()
});
/**
 * @route GET /api/messages/:userId/:partnerId
 * @desc Get messages between two users
 * @access Private
 */
router.get('/:userId/:partnerId', validateAuthToken, async (req, res) => {
    try {
        const { userId, partnerId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to access these messages' });
        }
        // Create the unique conversation ID (sorted user IDs to ensure consistency)
        const participants = [userId, partnerId].sort();
        const conversationId = `${participants[0]}_${participants[1]}`;
        // Get messages from Firestore
        const messagesSnapshot = await db.collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();
        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});
/**
 * @route POST /api/messages/:userId/:partnerId
 * @desc Send a new message
 * @access Private
 */
router.post('/:userId/:partnerId', validateAuthToken, async (req, res) => {
    try {
        const { userId, partnerId } = req.params;
        const messageData = req.body;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to send this message' });
        }
        // Validate message data
        const validationResult = MessageSchema.safeParse(messageData);
        if (!validationResult.success) {
            return res.status(400).json({ message: 'Invalid message data', errors: validationResult.error.issues });
        }
        // Create the message object
        const message = {
            senderId: userId,
            recipientId: partnerId,
            content: messageData.content,
            timestamp: messageData.timestamp || Timestamp.now(),
            read: false,
            conversationId: [userId, partnerId].sort().join('_'),
            ...(messageData.isEncrypted && {
                isEncrypted: true,
                encryptionInfo: messageData.encryptionInfo
            })
        };
        // Add the message to Firestore
        const messageRef = await db.collection('messages').add(message);
        // Update conversation metadata for both users
        await updateConversationMetadata(userId, partnerId, message);
        res.status(201).json({
            id: messageRef.id,
            ...message
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});
/**
 * @route DELETE /api/messages/:userId/:partnerId/:messageId
 * @desc Delete a message
 * @access Private
 */
router.delete('/:userId/:partnerId/:messageId', validateAuthToken, async (req, res) => {
    try {
        const { userId, partnerId, messageId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this message' });
        }
        // Get the message to verify ownership
        const messageDoc = await db.collection('messages').doc(messageId).get();
        if (!messageDoc.exists) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const message = messageDoc.data();
        // Check if user is the sender of the message
        if (message?.senderId !== userId) {
            return res.status(403).json({ message: 'You can only delete messages you sent' });
        }
        // Delete the message
        await db.collection('messages').doc(messageId).delete();
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
});
/**
 * @route GET /api/messages/:userId/conversations
 * @desc Get list of all conversations for a user
 * @access Private
 */
router.get('/:userId/conversations', validateAuthToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to access these conversations' });
        }
        // Get all conversations for the user
        const conversationsSnapshot = await db.collection('users')
            .doc(userId)
            .collection('conversations')
            .orderBy('lastMessageTime', 'desc')
            .get();
        const conversations = conversationsSnapshot.docs.map(doc => ({
            partnerId: doc.id,
            ...doc.data()
        }));
        // Get partner user details for each conversation
        const conversationsWithUserDetails = await Promise.all(conversations.map(async (conversation) => {
            const partnerDoc = await db.collection('users').doc(conversation.partnerId).get();
            const partnerData = partnerDoc.data();
            return {
                ...conversation,
                partner: {
                    id: partnerDoc.id,
                    displayName: partnerData?.displayName || 'Unknown User',
                    email: partnerData?.email || null,
                    // Add other user fields as needed
                }
            };
        }));
        res.json(conversationsWithUserDetails);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});
/**
 * @route PUT /api/messages/:userId/:partnerId/read
 * @desc Mark all messages from a conversation as read
 * @access Private
 */
router.put('/:userId/:partnerId/read', validateAuthToken, async (req, res) => {
    try {
        const { userId, partnerId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update these messages' });
        }
        // Create the unique conversation ID
        const participants = [userId, partnerId].sort();
        const conversationId = `${participants[0]}_${participants[1]}`;
        // Get all unread messages sent by the partner
        const messagesQuery = await db.collection('messages')
            .where('conversationId', '==', conversationId)
            .where('senderId', '==', partnerId)
            .where('read', '==', false)
            .get();
        // Mark messages as read in a batch
        const batch = db.batch();
        messagesQuery.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        // Reset unread count in the conversation
        const conversationRef = db.collection('users')
            .doc(userId)
            .collection('conversations')
            .doc(partnerId);
        batch.update(conversationRef, { unreadCount: 0 });
        // Commit all changes
        await batch.commit();
        res.json({ message: 'Messages marked as read', count: messagesQuery.size });
    }
    catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
});
/**
 * Helper function to update conversation metadata for both users
 */
async function updateConversationMetadata(senderId, recipientId, message) {
    const batch = db.batch();
    const senderRef = db.collection('users').doc(senderId).collection('conversations').doc(recipientId);
    const recipientRef = db.collection('users').doc(recipientId).collection('conversations').doc(senderId);
    // Update sender's conversation
    batch.set(senderRef, {
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        partnerId: recipientId,
        unreadCount: 0
    }, { merge: true });
    // Update recipient's conversation with unread increment
    batch.set(recipientRef, {
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        partnerId: senderId,
        unreadCount: FieldValue.increment(1)
    }, { merge: true });
    return batch.commit();
}
export default router;
