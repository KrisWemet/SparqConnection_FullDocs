# Sparq Connection Private Messaging API

This document describes the API endpoints for the private messaging feature.

## Authentication

All endpoints require authentication with a Firebase Auth token.
Tokens should be passed in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <firebase-token>
```

## Endpoints

### Get Messages

Retrieves messages between two users.

- **URL**: `/api/messages/:userId/:partnerId`
- **Method**: `GET`
- **Auth required**: Yes
- **Permissions required**: User can only access their own messages
- **URL Parameters**:
  - `userId`: ID of the logged-in user
  - `partnerId`: ID of the conversation partner

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
[
  {
    "id": "message123",
    "senderId": "user1",
    "recipientId": "user2",
    "content": "Hello, how are you?",
    "timestamp": "2023-06-20T15:30:00.000Z",
    "read": true,
    "conversationId": "user1_user2"
  },
  {
    "id": "message124",
    "senderId": "user2",
    "recipientId": "user1",
    "content": "I'm good, thanks!",
    "timestamp": "2023-06-20T15:35:00.000Z",
    "read": false,
    "conversationId": "user1_user2"
  }
]
```

#### Error Responses

- **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "message": "No token provided" }`
- **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You are not authorized to access these messages" }`
- **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "message": "Failed to fetch messages" }`

---

### Send Message

Sends a new message to another user.

- **URL**: `/api/messages/:userId/:partnerId`
- **Method**: `POST`
- **Auth required**: Yes
- **Permissions required**: User can only send messages from their own account
- **URL Parameters**:
  - `userId`: ID of the sender (logged-in user)
  - `partnerId`: ID of the recipient
- **Data constraints**:

```json
{
  "content": "[non-empty string]",
  "timestamp": "[optional, ISO date string or Firebase Timestamp]",
  "isEncrypted": "[optional, boolean]",
  "encryptionInfo": {
    "iv": "[string, required if isEncrypted is true]",
    "encryptedSessionKey": "[string, required if isEncrypted is true]"
  }
}
```

#### Success Response

- **Code**: 201 CREATED
- **Content example**:

```json
{
  "id": "new-message-id",
  "senderId": "user1",
  "recipientId": "user2",
  "content": "Hello, this is a new message",
  "timestamp": "2023-06-20T16:00:00.000Z",
  "read": false,
  "conversationId": "user1_user2"
}
```

#### Error Responses

- **Code**: 400 BAD REQUEST
  - **Content**: `{ "message": "Invalid message data", "errors": [...] }`
- **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "message": "No token provided" }`
- **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You are not authorized to send this message" }`
- **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "message": "Failed to send message" }`

---

### Delete Message

Deletes a message.

- **URL**: `/api/messages/:userId/:partnerId/:messageId`
- **Method**: `DELETE`
- **Auth required**: Yes
- **Permissions required**: User can only delete messages they sent
- **URL Parameters**:
  - `userId`: ID of the logged-in user
  - `partnerId`: ID of the conversation partner
  - `messageId`: ID of the message to delete

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
{
  "message": "Message deleted successfully"
}
```

#### Error Responses

- **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "message": "No token provided" }`
- **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You are not authorized to delete this message" }`
- **Code**: 404 NOT FOUND
  - **Content**: `{ "message": "Message not found" }`
- **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "message": "Failed to delete message" }`

---

### Get Conversations

Retrieves a list of all conversations for a user.

- **URL**: `/api/messages/:userId/conversations`
- **Method**: `GET`
- **Auth required**: Yes
- **Permissions required**: User can only access their own conversations
- **URL Parameters**:
  - `userId`: ID of the logged-in user

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
[
  {
    "partnerId": "user2",
    "lastMessage": "I'm good, thanks!",
    "lastMessageTime": "2023-06-20T15:35:00.000Z",
    "unreadCount": 1,
    "partner": {
      "id": "user2",
      "displayName": "Jane Doe",
      "email": "jane@example.com"
    }
  },
  {
    "partnerId": "user3",
    "lastMessage": "See you tomorrow!",
    "lastMessageTime": "2023-06-19T18:00:00.000Z",
    "unreadCount": 0,
    "partner": {
      "id": "user3",
      "displayName": "Bob Smith",
      "email": "bob@example.com"
    }
  }
]
```

#### Error Responses

- **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "message": "No token provided" }`
- **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You are not authorized to access these conversations" }`
- **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "message": "Failed to fetch conversations" }`

---

### Mark Messages as Read

Marks all messages from a specific user as read.

- **URL**: `/api/messages/:userId/:partnerId/read`
- **Method**: `PUT`
- **Auth required**: Yes
- **Permissions required**: User can only mark messages in their own conversations
- **URL Parameters**:
  - `userId`: ID of the logged-in user
  - `partnerId`: ID of the conversation partner

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
{
  "message": "Messages marked as read",
  "count": 3
}
```

#### Error Responses

- **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "message": "No token provided" }`
- **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You are not authorized to update these messages" }`
- **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "message": "Failed to mark messages as read" }`

## Data Structure

### Message Object

```json
{
  "id": "string",
  "senderId": "string",
  "recipientId": "string",
  "content": "string",
  "timestamp": "Firebase Timestamp or ISO date string",
  "read": "boolean",
  "conversationId": "string (format: 'smallerUserId_largerUserId')",
  "isEncrypted": "boolean (optional)",
  "encryptionInfo": {
    "iv": "string (initialization vector)",
    "encryptedSessionKey": "string"
  }
}
```

### Conversation Object

```json
{
  "partnerId": "string",
  "lastMessage": "string",
  "lastMessageTime": "Firebase Timestamp or ISO date string",
  "unreadCount": "number",
  "partner": {
    "id": "string",
    "displayName": "string",
    "email": "string (optional)"
  }
}
```

## Implementation Notes

- Messages are stored in a Firestore collection named `messages`
- Conversation metadata is stored in a subcollection under each user: `users/{userId}/conversations/{partnerId}`
- The `conversationId` field ensures consistent message grouping by sorting user IDs alphabetically
- Encryption is optional and can be implemented client-side with the encryption info stored for message decryption 