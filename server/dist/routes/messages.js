"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const zod_1 = require("zod");
const firestore_1 = require("firebase-admin/firestore");
const router = (0, express_1.Router)();
// Message schema using zod for validation
const MessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required'),
    timestamp: zod_1.z.instanceof(firestore_1.Timestamp).or(zod_1.z.date()).optional(),
    isEncrypted: zod_1.z.boolean().optional(),
    encryptionInfo: zod_1.z.object({
        iv: zod_1.z.string(),
        encryptedSessionKey: zod_1.z.string()
    }).optional()
});
/**
 * @route GET /api/messages/:userId/:partnerId
 * @desc Get messages between two users
 * @access Private
 */
router.get('/:userId/:partnerId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const messagesSnapshot = yield firebase_1.db.collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();
        const messages = messagesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
}));
/**
 * @route POST /api/messages/:userId/:partnerId
 * @desc Send a new message
 * @access Private
 */
router.post('/:userId/:partnerId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const message = Object.assign({ senderId: userId, recipientId: partnerId, content: messageData.content, timestamp: messageData.timestamp || firestore_1.Timestamp.now(), read: false, conversationId: [userId, partnerId].sort().join('_') }, (messageData.isEncrypted && {
            isEncrypted: true,
            encryptionInfo: messageData.encryptionInfo
        }));
        // Add the message to Firestore
        const messageRef = yield firebase_1.db.collection('messages').add(message);
        // Update conversation metadata for both users
        yield updateConversationMetadata(userId, partnerId, message);
        res.status(201).json(Object.assign({ id: messageRef.id }, message));
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
}));
/**
 * @route DELETE /api/messages/:userId/:partnerId/:messageId
 * @desc Delete a message
 * @access Private
 */
router.delete('/:userId/:partnerId/:messageId', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, partnerId, messageId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this message' });
        }
        // Get the message to verify ownership
        const messageDoc = yield firebase_1.db.collection('messages').doc(messageId).get();
        if (!messageDoc.exists) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const message = messageDoc.data();
        // Check if user is the sender of the message
        if ((message === null || message === void 0 ? void 0 : message.senderId) !== userId) {
            return res.status(403).json({ message: 'You can only delete messages you sent' });
        }
        // Delete the message
        yield firebase_1.db.collection('messages').doc(messageId).delete();
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
}));
/**
 * @route GET /api/messages/:userId/conversations
 * @desc Get list of all conversations for a user
 * @access Private
 */
router.get('/:userId/conversations', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const authReq = req;
        // Ensure user is authenticated
        if (!authReq.user || authReq.user.id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to access these conversations' });
        }
        // Get all conversations for the user
        const conversationsSnapshot = yield firebase_1.db.collection('users')
            .doc(userId)
            .collection('conversations')
            .orderBy('lastMessageTime', 'desc')
            .get();
        const conversations = conversationsSnapshot.docs.map(doc => (Object.assign({ partnerId: doc.id }, doc.data())));
        // Get partner user details for each conversation
        const conversationsWithUserDetails = yield Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            const partnerDoc = yield firebase_1.db.collection('users').doc(conversation.partnerId).get();
            const partnerData = partnerDoc.data();
            return Object.assign(Object.assign({}, conversation), { partner: {
                    id: partnerDoc.id,
                    displayName: (partnerData === null || partnerData === void 0 ? void 0 : partnerData.displayName) || 'Unknown User',
                    email: (partnerData === null || partnerData === void 0 ? void 0 : partnerData.email) || null,
                    // Add other user fields as needed
                } });
        })));
        res.json(conversationsWithUserDetails);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
}));
/**
 * @route PUT /api/messages/:userId/:partnerId/read
 * @desc Mark all messages from a conversation as read
 * @access Private
 */
router.put('/:userId/:partnerId/read', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const messagesQuery = yield firebase_1.db.collection('messages')
            .where('conversationId', '==', conversationId)
            .where('senderId', '==', partnerId)
            .where('read', '==', false)
            .get();
        // Mark messages as read in a batch
        const batch = firebase_1.db.batch();
        messagesQuery.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        // Reset unread count in the conversation
        const conversationRef = firebase_1.db.collection('users')
            .doc(userId)
            .collection('conversations')
            .doc(partnerId);
        batch.update(conversationRef, { unreadCount: 0 });
        // Commit all changes
        yield batch.commit();
        res.json({ message: 'Messages marked as read', count: messagesQuery.size });
    }
    catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
}));
/**
 * Helper function to update conversation metadata for both users
 */
function updateConversationMetadata(senderId, recipientId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const batch = firebase_1.db.batch();
        const senderRef = firebase_1.db.collection('users').doc(senderId).collection('conversations').doc(recipientId);
        const recipientRef = firebase_1.db.collection('users').doc(recipientId).collection('conversations').doc(senderId);
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
            unreadCount: firestore_1.FieldValue.increment(1)
        }, { merge: true });
        return batch.commit();
    });
}
exports.default = router;
