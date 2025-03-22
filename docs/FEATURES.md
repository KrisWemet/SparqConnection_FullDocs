# Sparq Connection Features

## Table of Contents
- [Core Features](#core-features)
- [User Authentication](#user-authentication)
- [Journey System](#journey-system)
- [Quizzes](#quizzes)
- [Prompts](#prompts)
- [Analytics](#analytics)
- [Private Messaging](#private-messaging)

## Core Features

Sparq Connection is a Progressive Web App (PWA) designed to help users connect, learn, and grow together. The application is built with React, TypeScript, and Firebase, providing a robust and scalable platform.

## User Authentication

Sparq Connection uses Firebase Authentication for secure user management:

- Email/password sign-up and login
- Google and Facebook social authentication
- Password reset functionality
- Email verification
- User profile management
- Role-based authorization (Admin, User)

## Journey System

The Journey System allows users to:

- Follow structured learning paths
- Track progress through content
- Earn badges and achievements
- Access personalized recommendations

## Quizzes

Interactive quizzes help users test their knowledge:

- Multiple-choice questions
- Progress tracking
- Immediate feedback
- Score history

## Prompts

Daily prompts encourage reflection:

- Thought-provoking questions
- Journaling capabilities
- Response sharing (optional)
- Historical review

## Analytics

Analytics help track user engagement:

- Content popularity metrics
- User activity tracking
- Progress monitoring
- Custom event tracking

## Private Messaging

The private messaging feature enables direct communication between users with enhanced privacy and security:

### Overview
- **Secure Communication**: End-to-end encrypted messaging between users
- **Real-time Updates**: Messages appear instantly with 30-second polling
- **Conversation Management**: Easy access to conversation history
- **Read Status**: Track when messages have been read
- **Unread Counts**: Visual indicators for unread messages
- **Message Deletion**: Users can delete their sent messages
- **Responsive Design**: Works seamlessly across devices

### Technical Implementation

#### Data Structure
Messages are stored in Firebase Firestore with the following schema:

```typescript
interface Message {
  id: string;            // Unique identifier
  senderId: string;      // User who sent the message
  recipientId: string;   // User receiving the message
  content: string;       // Message content
  timestamp: Timestamp;  // When the message was sent
  read: boolean;         // Whether the message has been read
  conversationId: string; // Combined IDs to identify the conversation
}

interface Conversation {
  partnerId: string;     // ID of the conversation partner
  lastMessage: string;   // Content of most recent message
  lastMessageTime: Timestamp; // When the last message was sent
  unreadCount: number;   // Number of unread messages
  partner: {             // Partner information
    id: string;
    displayName: string;
    email?: string;
  };
}
```

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages/:userId/:partnerId` | GET | Retrieves messages between two users |
| `/api/messages/:userId/:partnerId` | POST | Sends a new message |
| `/api/messages/:userId/:partnerId/:messageId` | DELETE | Deletes a specific message |
| `/api/messages/:userId/conversations` | GET | Retrieves all conversations for a user |
| `/api/messages/:userId/:partnerId/read` | PUT | Marks all messages in a conversation as read |

#### Security Features
- **Authentication**: All messaging endpoints require Firebase authentication
- **Authorization**: Users can only access their own messages
- **Input Validation**: Message content is validated before storage
- **Rate Limiting**: Prevents message flooding
- **Optional Encryption**: End-to-end encryption available for enhanced privacy

#### Frontend Components
The messaging UI is integrated into the application footer for easy access:
- **Toggle Interface**: Expand/collapse the messaging panel
- **Conversation List**: Shows all active conversations with unread indicators
- **Message Thread**: Displays the selected conversation with timestamp and read status
- **Message Composition**: Simple interface for typing and sending messages

#### Progressive Enhancement
- **Offline Support**: Messages composed while offline are sent when connection is restored
- **Push Notifications**: Users can receive notifications for new messages
- **Background Sync**: Messages are periodically synced in the background

#### Testing
The messaging feature has comprehensive test coverage including:
- Unit tests for API endpoints
- Authentication and authorization tests
- Error handling tests
- Edge case testing

#### Future Enhancements
- Group messaging capabilities
- Media sharing (images, files)
- Message reactions
- Voice messages
- Advanced search and filtering

## User Onboarding

The onboarding experience guides new users through their first interaction with Sparq Connection, helping them understand the platform and set up their journey.

### Onboarding Flow

1. **Welcome Introduction**
   - Triggers automatically on first login
   - Introduces users to the platform's core purpose
   - Smooth animations using Framer Motion
   - Responsive design for all devices

2. **Journey Selection**
   - Personalized journey suggestions
   - Interactive journey cards
   - Visual feedback on selection
   - Easy comparison of different paths

3. **Notification Setup**
   - Push notification permission request
   - Clear explanation of notification types
   - Emphasis on journey milestones
   - Option to enable/disable later

### Technical Implementation

#### Components

**OnboardingModal** (`client/src/components/OnboardingModal.tsx`)
```typescript
interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const OnboardingModal: React.FC = () => {
  // Manages onboarding state and flow
};
```

#### State Management

- Uses React hooks for local state
- Persists completion status in localStorage
- Integrates with authentication system
- Manages notification permissions

#### Animations

- Smooth transitions between steps
- Fade and slide effects
- Progress indicator animations
- Interactive button states

#### Usage

```typescript
// In your app's main component
import OnboardingModal from './components/OnboardingModal';

function App() {
  return (
    <>
      <OnboardingModal />
      {/* Rest of your app */}
    </>
  );
}
```

### Styling

The onboarding modal uses styled-components with emotion for consistent styling:

```typescript
const ModalContent = styled(motion.div)`
  // Responsive design
  max-width: 500px;
  width: 90%;
  
  // Visual aesthetics
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  // Animation support
  position: relative;
  overflow: hidden;
`;
```

### Best Practices

1. **Accessibility**
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - High contrast text
   - Screen reader compatibility

2. **Performance**
   - Lazy loading of images
   - Optimized animations
   - Minimal re-renders
   - Efficient state updates

3. **User Experience**
   - Clear progress indication
   - Easy navigation
   - Helpful error messages
   - Smooth transitions

4. **Mobile Optimization**
   - Touch-friendly targets
   - Responsive layouts
   - Gesture support
   - Orientation handling

### Testing

Run the onboarding tests:
```bash
npm test -- --grep "Onboarding"
```

Test coverage includes:
- Modal rendering
- Step navigation
- Journey selection
- Notification permission
- Completion handling

### Configuration

The onboarding flow can be customized through environment variables:

```env
REACT_APP_ENABLE_ONBOARDING=true
REACT_APP_NOTIFICATION_PROMPT=true
REACT_APP_MIN_JOURNEY_SUGGESTIONS=3
```

### Error Handling

1. **Network Issues**
   - Graceful fallback for image loading
   - Retry mechanism for API calls
   - Offline support
   - Error state displays

2. **Permission Handling**
   - Notification permission denied states
   - Alternative contact methods
   - Clear error messaging
   - Recovery options

### Analytics Integration

Track onboarding metrics:
- Completion rates
- Step drop-offs
- Journey selections
- Notification opt-ins

### Maintenance

Regular tasks:
1. Update journey suggestions
2. Refresh content
3. Monitor analytics
4. Update images

### Security Considerations

1. **Data Protection**
   - Secure storage of preferences
   - Privacy-first approach
   - GDPR compliance
   - Data minimization

2. **Authentication**
   - Session validation
   - Token management
   - Secure routes
   - Permission checks

## Contributing

When adding features to the onboarding flow:

1. Follow the existing pattern
2. Add appropriate tests
3. Update documentation
4. Consider accessibility
5. Maintain performance

## Future Enhancements

Planned improvements:
1. Personalization based on user data
2. A/B testing support
3. Multi-language support
4. Advanced analytics
5. Integration with user preferences

## Partner Invite System

The partner invite system allows users to connect with their partners through email or SMS invitations.

### Components

#### InvitePartner Component
- Located at: `client/src/components/InvitePartner.tsx`
- Provides a user interface for sending invitations via email or SMS
- Features:
  - Toggle between email and SMS methods
  - Input validation for email and phone numbers
  - Optional personal message
  - Real-time feedback and error handling
  - Responsive design for all device sizes

### Backend Routes

#### Invite API
- Located at: `server/routes/invite.ts`
- Endpoints:
  - `POST /api/invite`: Send an invitation
  - `GET /api/invite/:code`: Validate an invite code

### Data Model

```typescript
interface Invite {
  inviteCode: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  recipient: string;
  method: 'email' | 'sms';
  message?: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

### Features

1. **Multiple Invitation Methods**
   - Email invitations using SendGrid
   - SMS invitations using Twilio
   - Customizable templates for both methods

2. **Security**
   - Authentication required for sending invites
   - Unique invite codes
   - 7-day expiration for invites
   - Input validation and sanitization

3. **User Experience**
   - Real-time validation
   - Loading states
   - Error handling
   - Success notifications
   - Mobile-responsive design

4. **Tracking**
   - Invite status tracking
   - Expiration management
   - Analytics integration

### Configuration

Required environment variables:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@sparqconnection.com
SENDGRID_INVITE_TEMPLATE_ID=your_template_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
CLIENT_URL=https://your-app-url.com
```

### Usage

1. **Sending an Invitation**
```typescript
// Example API call
const response = await fetch('/api/invite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    method: 'email',
    recipient: 'partner@example.com',
    message: 'Let\'s connect!',
  }),
});
```

2. **Validating an Invite**
```typescript
// Example API call
const response = await fetch(`/api/invite/${inviteCode}`);
const data = await response.json();
```

### Error Handling

The system handles various error cases:
- Invalid email/phone formats
- Network errors
- Rate limiting
- Expired invites
- Authentication errors

### Testing

Tests are included for both frontend and backend:
- Component tests for InvitePartner
- API route tests for invite endpoints
- Integration tests for the complete flow

### Best Practices

1. **Security**
   - Validate all inputs
   - Rate limit invite attempts
   - Secure storage of sensitive data
   - Proper error handling

2. **Performance**
   - Optimized API calls
   - Efficient database queries
   - Proper caching implementation

3. **Maintenance**
   - Regular monitoring of invite status
   - Cleanup of expired invites
   - Analytics tracking
   - Error logging

### Future Enhancements

1. **Additional Features**
   - WhatsApp integration
   - In-app notifications
   - Bulk invites
   - Custom invite templates

2. **Improvements**
   - Enhanced analytics
   - A/B testing of messages
   - Multi-language support
   - Advanced rate limiting

## Daily Connection Log

The daily log feature enables users to track their daily relationship-building actions and reflect on their impact.

### Components

#### DailyLog Component
- Located at: `client/src/components/DailyLog.tsx`
- Provides a user interface for submitting daily relationship actions
- Features:
  - One action per day limit
  - Reflection text field
  - Mood tracking (1-5 scale)
  - Real-time validation
  - Mobile-responsive design

### Backend Routes

#### DailyLog API
- Located at: `server/routes/dailyLog.ts`
- Endpoints:
  - `POST /api/dailyLog`: Submit a daily log
  - `GET /api/dailyLog/today`: Check today's log
  - `GET /api/dailyLog/history`: Get log history
  - `GET /api/dailyLog/stats`: Get logging statistics

### Data Model

```typescript
interface DailyLogEntry {
  action: string;
  reflection: string;
  mood: 1 | 2 | 3 | 4 | 5;
  date: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Features

1. **Daily Action Tracking**
   - One meaningful action per day
   - Optional reflection text
   - Mood tracking
   - Date stamping

2. **Security**
   - Authentication required
   - One entry per day limit
   - Input validation
   - User data isolation

3. **User Experience**
   - Real-time validation
   - Loading states
   - Error handling
   - Success notifications
   - Mobile-responsive design

4. **Analytics**
   - Streak tracking
   - Mood trends
   - Completion rates
   - Historical data

### Usage

1. **Submitting a Daily Log**
```typescript
// Example API call
const response = await fetch('/api/dailyLog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    action: 'Had a meaningful conversation about our future',
    reflection: 'It helped us align our goals',
    mood: 5,
    date: '2024-02-20',
  }),
});
```

2. **Checking Today's Log**
```typescript
// Example API call
const response = await fetch('/api/dailyLog/today', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
  },
});
```

3. **Getting Log History**
```typescript
// Example API call
const response = await fetch('/api/dailyLog/history?limit=30', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
  },
});
```

### Error Handling

The system handles various error cases:
- Missing required fields
- Invalid mood values
- Duplicate daily entries
- Authentication errors
- Network errors

### Testing

Tests are included for both frontend and backend:
- Component tests for DailyLog
- API route tests for all endpoints
- Integration tests for the complete flow

### Best Practices

1. **Security**
   - Validate all inputs
   - Enforce daily limits
   - Secure data storage
   - Proper error handling

2. **Performance**
   - Optimized queries
   - Efficient data structure
   - Proper caching
   - Minimal re-renders

3. **Maintenance**
   - Regular data cleanup
   - Analytics monitoring
   - Error logging
   - Performance tracking

### Future Enhancements

1. **Additional Features**
   - Action categories
   - Photo attachments
   - Partner notifications
   - Custom reminders

2. **Improvements**
   - Advanced analytics
   - Mood insights
   - Action suggestions
   - Sharing options

### Firebase Structure

```
/users/{userId}/dailyLog/{logId}
  - action: string
  - reflection: string
  - mood: number
  - date: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Analytics Integration

Track key metrics:
- Daily completion rates
- Average mood scores
- Streak statistics
- Popular action types

### Mobile Optimization

1. **Responsive Design**
   - Flexible layouts
   - Touch-friendly inputs
   - Gesture support
   - Offline capability

2. **Performance**
   - Lazy loading
   - Image optimization
   - State management
   - Network handling

### Accessibility

1. **Features**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

2. **Testing**
   - Accessibility audit
   - Screen reader testing
   - Keyboard navigation
   - Color contrast 