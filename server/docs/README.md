# Sparq Connection Private Messaging

## Overview

This implementation adds a private messaging feature to the Sparq Connection progressive web application. The messaging system uses Firebase Firestore as the backend database and includes all basic messaging functionality with privacy and security considerations.

## Features

- **Private Conversations**: Users can have one-on-one private conversations with other users
- **Real-time Updates**: Messages are delivered in real-time (when implemented with WebSockets/Firebase)
- **Message History**: Users can view their entire message history for each conversation
- **Read Status**: Messages show whether they've been read by the recipient
- **Unread Counts**: Conversation list shows unread message counts
- **Message Deletion**: Users can delete messages they've sent
- **Offline Support**: Messages can be cached for offline viewing (using service workers)
- **Optional End-to-End Encryption**: Framework for adding E2E encryption is included

## Implementation

### Backend (Firebase)

- **Messages Collection**: Stores all messages in a single collection with appropriate indexes
- **Conversation Metadata**: Stored in subcollections for each user for quick access
- **Authentication**: Firebase Auth ensures only authorized users can access messages
- **Security Rules**: Firestore security rules restrict access to only relevant parties
- **Validation**: Input validation ensures data integrity

### API Endpoints

The following RESTful endpoints have been implemented:

- `GET /api/messages/:userId/:partnerId` - Get messages between two users
- `POST /api/messages/:userId/:partnerId` - Send a new message
- `DELETE /api/messages/:userId/:partnerId/:messageId` - Delete a message
- `GET /api/messages/:userId/conversations` - Get list of all conversations
- `PUT /api/messages/:userId/:partnerId/read` - Mark messages as read

### Data Structure

**Message Object**:
```json
{
  "id": "string",
  "senderId": "string",
  "recipientId": "string",
  "content": "string",
  "timestamp": "Firebase Timestamp",
  "read": "boolean",
  "conversationId": "string"
}
```

**Conversation Metadata**:
```json
{
  "partnerId": "string",
  "lastMessage": "string",
  "lastMessageTime": "Firebase Timestamp",
  "unreadCount": "number"
}
```

## Documentation

- [API Documentation](./messaging-api.md) - Detailed API reference for the messaging endpoints
- [Client Implementation Guide](./client-implementation.md) - Guide for implementing the client-side functionality

## Security Considerations

- **Authentication Required**: All endpoints require valid Firebase authentication
- **Authorization Checks**: Users can only access their own messages
- **Input Validation**: All user input is validated using Zod schemas
- **Rate Limiting**: Should be implemented to prevent abuse (TODO)
- **Encryption**: Framework for end-to-end encryption is included (client-side implementation)

## Progressive Web App Features

- **Offline Support**: Service worker caching enables offline message viewing
- **Push Notifications**: Integration with Firebase Cloud Messaging for real-time notifications
- **Installable**: Messaging works in the installed PWA context
- **Responsive Design**: UI adapts to all device sizes

## Future Enhancements

Potential future additions:

- Group messaging
- Media sharing (images, files, etc.)
- Message reactions
- Typing indicators
- Message formatting (markdown, etc.)
- Voice/video calling integration

## Performance Considerations

- Messages are paginated to handle large conversations
- Efficient Firestore queries with appropriate indexes
- Conversation metadata provides quick access to latest messages

## Testing

Test suite includes:
- Unit tests for API endpoints
- Mock Firebase functionality for testing
- Authentication test cases
- Error handling tests 