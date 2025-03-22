# Client-Side Implementation Guide for Sparq Connection Messaging

This guide describes how to implement the client-side functionality for the private messaging feature in Sparq Connection.

## Authentication

Before making API calls, ensure the user is authenticated using Firebase Authentication:

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const authenticate = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};
```

## API Client

Create a messaging service to handle API calls:

```javascript
class MessagingService {
  constructor(baseUrl, getToken) {
    this.baseUrl = baseUrl;
    this.getToken = getToken; // Function that returns the current auth token
  }

  async request(endpoint, method = 'GET', data = null) {
    const token = await this.getToken();
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return method === 'DELETE' ? null : await response.json();
  }

  // Get messages between two users
  async getMessages(userId, partnerId) {
    return this.request(`/api/messages/${userId}/${partnerId}`);
  }

  // Send a message
  async sendMessage(userId, partnerId, content, isEncrypted = false, encryptionInfo = null) {
    const messageData = {
      content,
      timestamp: new Date(),
      ...(isEncrypted && { isEncrypted, encryptionInfo })
    };
    
    return this.request(`/api/messages/${userId}/${partnerId}`, 'POST', messageData);
  }

  // Delete a message
  async deleteMessage(userId, partnerId, messageId) {
    return this.request(`/api/messages/${userId}/${partnerId}/${messageId}`, 'DELETE');
  }

  // Get all conversations
  async getConversations(userId) {
    return this.request(`/api/messages/${userId}/conversations`);
  }

  // Mark messages as read
  async markAsRead(userId, partnerId) {
    return this.request(`/api/messages/${userId}/${partnerId}/read`, 'PUT');
  }
}

// Usage
const messagingService = new MessagingService(
  'https://your-api-url.com',
  async () => await auth.currentUser.getIdToken()
);
```

## React Components

Here are basic React components for implementing the messaging UI:

### Conversation List

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Custom hook for authentication

const ConversationList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, messagingService } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await messagingService.getConversations(user.uid);
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, messagingService]);

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      {loading ? (
        <p>Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.partnerId}
              className={conversation.unreadCount > 0 ? 'unread' : ''}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.partner.displayName[0]}
              </div>
              <div className="conversation-info">
                <h3>{conversation.partner.displayName}</h3>
                <p>{conversation.lastMessage}</p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="unread-badge">{conversation.unreadCount}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;
```

### Message Thread

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth'; // Custom hook for authentication

const MessageThread = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, messagingService } = useAuth();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation || !user) return;
      
      try {
        setLoading(true);
        const data = await messagingService.getMessages(user.uid, conversation.partnerId);
        setMessages(data);
        
        // Mark messages as read
        if (conversation.unreadCount > 0) {
          await messagingService.markAsRead(user.uid, conversation.partnerId);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation, user, messagingService]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation) return;

    try {
      const sentMessage = await messagingService.sendMessage(
        user.uid,
        conversation.partnerId,
        newMessage
      );
      
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!user || !conversation) return;
    
    try {
      await messagingService.deleteMessage(user.uid, conversation.partnerId, messageId);
      setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (!conversation) {
    return <div className="message-thread empty">Select a conversation</div>;
  }

  return (
    <div className="message-thread">
      <div className="thread-header">
        <h2>{conversation.partner.displayName}</h2>
      </div>
      
      <div className="messages-container">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.senderId === user.uid ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {new Date(message.timestamp.seconds * 1000).toLocaleTimeString()}
                </div>
                {message.senderId === user.uid && (
                  <button
                    className="delete-message"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageThread;
```

### Main Messaging Page

```jsx
import React, { useState } from 'react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

const MessagingPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        <ConversationList onSelectConversation={setSelectedConversation} />
        <MessageThread conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default MessagingPage;
```

## Optional: End-to-End Encryption

For enhanced privacy, you can implement end-to-end encryption:

```javascript
// Encryption utilities
import { getRandomValues } from 'crypto';

class MessageEncryption {
  // Generate encryption keys
  static async generateKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    return keyPair;
  }
  
  // Export public key for sharing
  static async exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(exported)));
  }
  
  // Generate a random session key
  static async generateSessionKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Encrypt message with session key
  static async encryptMessage(message, sessionKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Create initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      sessionKey,
      data
    );
    
    return {
      data: btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData))),
      iv: btoa(String.fromCharCode.apply(null, iv)),
    };
  }
  
  // Encrypt session key with recipient's public key
  static async encryptSessionKey(sessionKey, recipientPublicKey) {
    const exportedSessionKey = await window.crypto.subtle.exportKey(
      'raw',
      sessionKey
    );
    
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      recipientPublicKey,
      exportedSessionKey
    );
    
    return btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedKey)));
  }
  
  // Decrypt message
  static async decryptMessage(encryptedMessage, iv, sessionKey) {
    const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      sessionKey,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
  
  // Decrypt session key with private key
  static async decryptSessionKey(encryptedKey, privateKey) {
    const encryptedKeyData = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    
    const decryptedKey = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedKeyData
    );
    
    return await window.crypto.subtle.importKey(
      'raw',
      decryptedKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}
```

## CSS Styling

Here's some basic CSS to style the messaging components:

```css
/* Messaging layout */
.messaging-page {
  display: flex;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fb;
}

.messaging-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  margin: 50px auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Conversation list */
.conversation-list {
  width: 300px;
  background-color: #f9f9f9;
  border-right: 1px solid #e6e6e6;
  overflow-y: auto;
}

.conversation-list h2 {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e6e6e6;
}

.conversation-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.conversation-list li {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e6e6e6;
  transition: background-color 0.2s;
}

.conversation-list li:hover {
  background-color: #f0f0f0;
}

.conversation-list li.unread {
  background-color: #edf7ff;
}

.conversation-avatar {
  width: 50px;
  height: 50px;
  background-color: #5b6ad8;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 15px;
}

.conversation-info {
  flex: 1;
}

.conversation-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.conversation-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.unread-badge {
  background-color: #4b7bec;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 2px;
}

/* Message thread */
.message-thread {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-thread.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 18px;
}

.thread-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #ffffff;
}

.thread-header h2 {
  margin: 0;
  font-size: 18px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.no-messages {
  text-align: center;
  color: #888;
  margin-top: 50px;
}

.messages {
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 70%;
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
}

.message.sent {
  align-self: flex-end;
  background-color: #5b6ad8;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.received {
  align-self: flex-start;
  background-color: #e9e9eb;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  margin-bottom: 5px;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  text-align: right;
}

.delete-message {
  position: absolute;
  top: -20px;
  right: 0;
  background: none;
  border: none;
  color: #ff5c5c;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .delete-message {
  opacity: 1;
}

/* Message form */
.message-form {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  background-color: white;
}

.message-form input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.message-form button {
  margin-left: 10px;
  padding: 0 20px;
  background-color: #5b6ad8;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.message-form button:hover {
  background-color: #4a57c1;
}

.message-form button:disabled {
  background-color: #c5c9e8;
  cursor: not-allowed;
}
```

## Integration with Push Notifications

For real-time notifications, integrate with Firebase Cloud Messaging (FCM):

```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const setupPushNotifications = async (user) => {
  try {
    const messaging = getMessaging();
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }
    
    // Get FCM token
    const fcmToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY_HERE'
    });
    
    // Save the token to the user's record in Firestore
    await updateUserFcmToken(user.uid, fcmToken);
    
    // Handle incoming messages when app is in foreground
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      // Display notification or update UI
      // e.g., increment unread count and refresh conversations
    });
    
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
};

// Update user's FCM token in Firestore
const updateUserFcmToken = async (userId, token) => {
  await fetch(`/api/users/${userId}/fcm-token`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
    },
    body: JSON.stringify({ token })
  });
};
```

This guide covers the basics of implementing private messaging in a PWA using Firebase. Additional features like typing indicators, message delivery status, and file/image sharing can be added by extending these components. 