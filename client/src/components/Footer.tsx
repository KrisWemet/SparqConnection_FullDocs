import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComment, FaPaperPlane, FaTimes, FaLock } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { encrypt, decrypt } from '../utils/encryption';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: any; // Firebase Timestamp
  read: boolean;
  conversationId: string;
}

interface Conversation {
  partnerId: string;
  lastMessage: string;
  lastMessageTime: any; // Firebase Timestamp
  unreadCount: number;
  partner: {
    id: string;
    displayName: string;
    email?: string;
  };
}

interface FooterProps {
  partnerId: string;
}

// Memoized footer link component
const FooterLink = React.memo<{
  to: string;
  children: React.ReactNode;
}>(({ to, children }) => (
  <Link
    to={to}
    className="text-gray-300 hover:text-white transition-colors duration-200"
  >
    {children}
  </Link>
));

// Memoized footer section component
const FooterSection = React.memo<{
  title: string;
  children: React.ReactNode;
}>(({ title, children }) => (
  <div>
    <h3 className="text-white font-semibold mb-4">{title}</h3>
    <ul className="space-y-2">{children}</ul>
  </div>
));

// Memoized social link component
const SocialLink = React.memo<{
  href: string;
  icon: React.ReactNode;
  label: string;
}>(({ href, icon, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-300 hover:text-white transition-colors duration-200"
    whileHover={{ scale: 1.1 }}
    aria-label={label}
  >
    {icon}
  </motion.a>
));

export const Footer: React.FC<FooterProps> = React.memo(({ partnerId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Fetch conversations
  useEffect(() => {
    if (!user || !isExpanded) return;
    
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${user.uid}/conversations`, {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, isExpanded]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedConversation) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${user.uid}/${selectedConversation.partnerId}`, {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          
          // Mark messages as read
          if (selectedConversation.unreadCount > 0) {
            markMessagesAsRead();
          }
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up polling
    const interval = setInterval(fetchMessages, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to get auth token - replace with your implementation
  const getAuthToken = async (): Promise<string> => {
    // Replace with actual token retrieval
    return 'mock-auth-token';
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!user || !selectedConversation) return;

    try {
      await fetch(`/api/messages/${user.uid}/${selectedConversation.partnerId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });
      
      // Update the conversation in state to reflect read messages
      setConversations(prev => prev.map(conv =>
        conv.partnerId === selectedConversation.partnerId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${user.uid}/${selectedConversation.partnerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          content: newMessage,
          timestamp: new Date()
        })
      });
      
      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Update conversation last message
        setConversations(prev => prev.map(conv =>
          conv.partnerId === selectedConversation.partnerId
            ? { 
                ...conv, 
                lastMessage: newMessage,
                lastMessageTime: new Date()
              }
            : conv
        ));
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user || !selectedConversation) return;
    
    try {
      const response = await fetch(`/api/messages/${user.uid}/${selectedConversation.partnerId}/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    try {
      // Handle Firebase Timestamp objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Count total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">© 2023 Sparq Connection</span>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Messages</span>
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Interface */}
      {isExpanded && (
        <div 
          ref={chatContainerRef}
          className="fixed bottom-16 right-0 w-full md:w-96 bg-white border border-gray-200 rounded-t-lg shadow-lg"
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-gray-200 h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-700">Conversations</h2>
              </div>
              
              {loading && conversations.length === 0 ? (
                <div className="flex justify-center items-center h-20">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex justify-center items-center h-20">
                  <p className="text-sm text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <ul>
                  {conversations.map((conversation) => (
                    <li
                      key={conversation.partnerId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.partnerId === conversation.partnerId
                          ? 'bg-blue-50'
                          : ''
                      } ${conversation.unreadCount > 0 ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          {conversation.partner.displayName.charAt(0)}
                        </div>
                        <div className="ml-2 overflow-hidden">
                          <p className="text-sm truncate">{conversation.partner.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-auto bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Message Thread */}
            <div className="w-2/3 flex flex-col h-96">
              {selectedConversation ? (
                <>
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-700">
                      {selectedConversation.partner.displayName}
                    </h2>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto">
                    {loading && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-gray-500">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-gray-500">No messages yet. Start a conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${user && message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`relative max-w-xs px-4 py-2 rounded-lg ${
                                user && message.senderId === user.uid
                                  ? 'bg-blue-500 text-white ml-auto'
                                  : 'bg-gray-200 text-gray-800 mr-auto'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <span className="text-xs opacity-75 mt-1 block">
                                {formatTime(message.timestamp)}
                              </span>
                              {user && message.senderId === user.uid && (
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="absolute -right-6 top-0 text-gray-500 hover:text-red-500"
                                  aria-label="Delete message"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 