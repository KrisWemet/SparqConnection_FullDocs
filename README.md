# Sparq Connection

A Progressive Web App (PWA) designed to help couples strengthen their relationships through daily prompts, quizzes, analytics, and gamification features.

## Features

- Daily relationship prompts with mood tracking
- Interactive relationship quizzes
- Gamification system with points, badges, and streaks
- Real-time analytics and progress tracking
- Responsive design for all devices
- PWA capabilities for offline use
- Expert advice and advanced analytics (freely available to all users)

## Project Structure

```
sparq-connection/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── services/    # API and utility services
│   └── public/          # Static assets
└── server/              # Express backend
    ├── src/
    │   ├── config/      # Configuration files
    │   ├── controllers/ # Route controllers
    │   ├── models/      # Database models
    │   ├── routes/      # API routes
    │   └── middleware/  # Custom middleware
    └── dist/            # Compiled TypeScript
└── sanity/            # Sanity CMS Studio
    ├── schemas/       # Content schemas
    └── src/          # Studio customization
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git
- Sanity CLI (`npm install -g @sanity/cli`)

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Chart.js for data visualization
- PWA features with service workers

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- Passport.js for authentication
- Socket.IO for real-time features

### Third-Party Services
- Sanity CMS for content management
- Firebase for notifications

## Note on Premium Features
All features in Sparq Connection are currently freely available to all users. We plan to introduce premium subscriptions in the future, but for now, we're focused on providing the best possible experience to our users without any paywalls.

When premium subscriptions are reintroduced, they will include:
- Advanced analytics and insights
- Priority access to new features
- Enhanced customization options
- Premium expert advice content

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sparq-connection.git
cd sparq-connection
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_VAPID_KEY=your-vapid-key

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your-firebase-config
```

4. Start development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd ../client
npm start
```

## Analytics & Gamification

### Points System
- Daily prompt responses: 10 points
- Quiz completions: 20-50 points based on score
- Streak bonuses: 5 points per day of streak
- Badge achievements: 25-100 points

### Analytics Features

#### Response Time Heatmap
The heatmap visualization shows when users are most active in responding to prompts:
- X-axis: Hours of the day (0-23)
- Y-axis: Days of the week (Sunday-Saturday)
- Color intensity: Number of responses
- Hover tooltip: Exact response count

This helps identify:
- Peak engagement times
- Patterns in user activity
- Optimal times for notifications

#### Badge Distribution
The pie chart shows the distribution of earned badges:
- Each segment represents a badge type
- Size indicates percentage of total badges earned
- Interactive legend for filtering
- Hover tooltips with detailed stats

#### Engagement Metrics
Key performance indicators:
- Total responses submitted
- Average responses per day
- Total badges earned
- Badge completion rate

### Data Visualization
- Real-time updates using Socket.io
- Responsive design for all screen sizes
- Accessible color schemes
- Interactive tooltips and legends
- Smooth animations using Framer Motion

### Badges
- First Response: Complete your first prompt
- Quiz Master: Score 90%+ on 5 quizzes
- Streak Champion: Maintain a 7-day streak
- Relationship Guru: Earn 1000 points

### Analytics Features
- Points history visualization
- Streak tracking and history
- Badge collection display
- Quiz performance metrics
- Mood trend analysis

## Real-time Gamification Updates

The app uses polling to provide near real-time updates for gamification features (points, streaks, badges).

### Polling Configuration

- Gamification stats are polled every 30 seconds
- The polling interval can be configured by modifying the `POLLING_INTERVAL` constant in `client/src/components/Gamification.tsx`
- The app includes loading states and error handling for a smooth user experience

### Implementation Details

- The frontend periodically calls the `/api/gamification/status` endpoint
- Updates are fetched automatically in the background
- Loading states prevent UI flickering during updates
- Error handling with automatic retries
- Cleanup on component unmount to prevent memory leaks

### Testing Polling Updates

1. Start both the server and client applications
2. Log in with a test user
3. Open the Network tab in browser DevTools
4. Observe periodic requests to `/api/gamification/status`
5. Perform actions that earn points (e.g., complete a quiz, answer a prompt)
6. Verify that the UI updates within 30 seconds

### Security Considerations

- All API requests require authentication
- Rate limiting is implemented to prevent abuse
- Efficient caching to reduce server load
- All communication is secured using HTTPS

## Testing and Logging

### Testing with Jest
The application uses Jest for unit and integration testing. The test suite covers:
- API endpoints
- Database operations
- Utility functions
- Authentication and authorization

To run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test files are located in `src/__tests__` directories and follow the naming pattern `*.test.ts` or `*.spec.ts`.

### Logging with Winston
The application uses Winston for logging, with the following features:
- Daily rotating log files
- Separate access and error logs
- JSON format for structured logging
- Console output in development

Log files are stored in the `logs` directory:
- `access-YYYY-MM-DD.log`: API requests and general information
- `error-YYYY-MM-DD.log`: Error logs with stack traces

Log rotation settings:
- Maximum file size: 20MB
- Files kept for 14 days
- Daily rotation at midnight

To view logs:
```bash
# View latest access logs
tail -f logs/access-$(date +%Y-%m-%d).log

# View latest error logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Search logs for specific request
grep "POST /api/auth/login" logs/access-*.log

# View errors from the last hour
find logs -name "error-*.log" -mmin -60 -exec cat {} \;
```

Example log entry:
```json
{
  "timestamp": "2024-03-17T12:34:56.789Z",
  "level": "info",
  "message": "API Request",
  "method": "POST",
  "url": "/api/auth/login",
  "status": 200,
  "duration": 123,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Best Practices
1. **Testing**:
   - Write tests for all new features
   - Maintain high test coverage
   - Use meaningful test descriptions
   - Mock external dependencies

2. **Logging**:
   - Log all API requests
   - Include relevant context in logs
   - Use appropriate log levels
   - Rotate logs to manage disk space
   - Never log sensitive information

3. **Error Handling**:
   - Log all errors with stack traces
   - Use structured error responses
   - Include error context when logging
   - Handle async errors properly

### Journey Interaction Logging

The application includes specialized logging for journey interactions using Winston. These logs help track user engagement and analyze journey completion patterns.

#### Log File Structure
Journey logs are stored in `logs/journey-YYYY-MM-DD.log` with the following features:
- Daily rotation with 14-day retention
- Maximum file size of 20MB
- JSON format for easy parsing
- Automatic timestamp and service name

#### Event Types
1. **Journey Start** (`JOURNEY_START`):
   ```json
   {
     "eventType": "JOURNEY_START",
     "userId": "user123",
     "journeyId": "journey456",
     "metadata": {
       "journeyTitle": "5 Love Languages"
     },
     "timestamp": "2024-03-17T12:34:56.789Z"
   }
   ```

2. **Day Completion** (`DAY_COMPLETE`):
   ```json
   {
     "eventType": "DAY_COMPLETE",
     "userId": "user123",
     "journeyId": "journey456",
     "dayNumber": 1,
     "metadata": {
       "journeyTitle": "5 Love Languages"
     },
     "timestamp": "2024-03-17T12:34:56.789Z"
   }
   ```

3. **Reflection Submission** (`REFLECTION_SUBMIT`):
   ```json
   {
     "eventType": "REFLECTION_SUBMIT",
     "userId": "user123",
     "journeyId": "journey456",
     "dayNumber": 1,
     "reflectionLength": 250,
     "metadata": {
       "journeyTitle": "5 Love Languages"
     },
     "timestamp": "2024-03-17T12:34:56.789Z"
   }
   ```

4. **Journey Completion** (`JOURNEY_COMPLETE`):
   ```json
   {
     "eventType": "JOURNEY_COMPLETE",
     "userId": "user123",
     "journeyId": "journey456",
     "metadata": {
       "journeyTitle": "5 Love Languages",
       "totalDays": 5
     },
     "timestamp": "2024-03-17T12:34:56.789Z"
   }
   ```

#### Analyzing Journey Logs

1. **View Recent Journey Activity**:
   ```bash
   # View today's journey logs
   tail -f logs/journey-$(date +%Y-%m-%d).log | jq '.'

   # View specific user's journey activity
   grep '"userId":"user123"' logs/journey-*.log | jq '.'

   # Count journey completions by day
   grep JOURNEY_COMPLETE logs/journey-*.log | wc -l
   ```

2. **Calculate Engagement Metrics**:
   ```bash
   # Average reflection length
   grep REFLECTION_SUBMIT logs/journey-*.log | \
     jq -r '.reflectionLength' | \
     awk '{ sum += $1 } END { print sum/NR }'

   # Journey completion rate
   echo "scale=2; $(grep JOURNEY_COMPLETE logs/journey-*.log | wc -l) / \
     $(grep JOURNEY_START logs/journey-*.log | wc -l) * 100" | bc
   ```

3. **Export for Analysis**:
   ```bash
   # Export all journey events to CSV
   jq -r '[.eventType,.userId,.journeyId,.timestamp] | @csv' \
     logs/journey-*.log > journey_events.csv
   ```

#### Best Practices
1. **Log Rotation**:
   - Monitor log file sizes
   - Archive old logs if needed
   - Compress logs older than 14 days

2. **Performance**:
   - Logs are written asynchronously
   - Use appropriate log levels
   - Include relevant context without oversharing

3. **Security**:
   - Never log sensitive user data
   - Sanitize log output
   - Restrict log file access

4. **Analysis**:
   - Regular review of completion rates
   - Monitor user engagement patterns
   - Track average reflection lengths
   - Identify popular journey times

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Expert Advice Feature

The Expert Advice feature provides users with relationship tips and insights from experts, unlocked through gamification progress.

### Features
- Points-based unlocking system
- Category-based organization (Communication, Conflict Resolution, etc.)
- Expert profiles with credentials and avatars
- Progress tracking with visual indicators
- Responsive design for all device sizes
- Real-time updates with user's points

### Adding Expert Advice via Sanity CMS

1. Log in to your Sanity Studio
2. Navigate to "Expert Advice" in the content types
3. Click "Create new Expert Advice"
4. Fill in the required fields:
   - Title: The advice title
   - Content: The advice content (supports rich text)
   - Points Required: Number of points needed to unlock
   - Category: Select from predefined categories
   - Expert: Add expert details (name, credentials, avatar)
5. Click "Publish" to make the advice available

### Testing the Feature

1. Backend Tests:
   ```bash
   cd server
   npm test src/__tests__/expertAdvice.test.ts
   ```

2. Manual Testing:
   - Log in to the application
   - Navigate to the Expert Advice section
   - Verify that tips are properly locked/unlocked based on points
   - Check that progress indicators update correctly
   - Test responsiveness on different devices

### API Endpoints

#### GET /api/expert-advice
Returns all expert advice with unlock status based on user's points.

Response format:
```json
{
  "user_points": 100,
  "tips_by_category": {
    "communication": [
      {
        "_id": "tip1",
        "title": "Effective Communication",
        "points_required": 50,
        "is_unlocked": true,
        "points_needed": 0
      }
    ]
  }
}
```

#### GET /api/expert-advice/:id
Returns a specific expert advice tip if the user has enough points.

Response format:
```json
{
  "_id": "tip1",
  "title": "Effective Communication",
  "content": [...],
  "points_required": 50,
  "category": "communication",
  "expert": {
    "name": "Dr. Smith",
    "credentials": "PhD in Psychology"
  },
  "is_unlocked": true
}
```

### Environment Variables

Add these to your `.env` file:
```
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-03-17
```

## AI Personalization

Sparq Connection uses TensorFlow.js to provide personalized content recommendations based on user behavior and engagement patterns. The AI system analyzes:

- Response history and patterns
- Quiz performance
- Topic preferences
- Engagement levels

### How It Works

1. **Feature Extraction**:
   - Calculates user's average quiz scores
   - Analyzes response frequency and patterns
   - Identifies topic preferences
   - Measures overall engagement level

2. **Neural Network Model**:
   - Uses a lightweight neural network with 3 layers
   - Input features: 6 normalized user metrics
   - Hidden layers: 12 and 8 units with ReLU activation
   - Output layer: 4 units with softmax activation for content type prediction

3. **Content Scoring**:
   - Combines model predictions with user preferences
   - Weighs factors like topic relevance and difficulty level
   - Provides personalized prompt and quiz recommendations

### Testing the AI Features

1. **Local Development**:
   ```bash
   # Start the development server
   cd server
   npm install
   npm run dev

   # Start the client
   cd ../client
   npm install
   npm start
   ```

2. **Testing Recommendations**:
   - Complete several prompts and quizzes to build user history
   - Visit the dashboard to see personalized recommendations
   - Check the "Recommended for You" section for AI-suggested content

3. **Monitoring**:
   - View your engagement level and topic preferences
   - Track suggested topics for exploration
   - Monitor how recommendations change with user activity

### Performance and Optimization

- Lightweight model design for client-side execution
- Efficient feature extraction and normalization
- Caching of model predictions for improved performance
- Progressive enhancement based on user interaction history

## Push Notifications Setup

### Firebase Cloud Messaging (FCM)

The app uses Firebase Cloud Messaging for push notifications. To set up FCM:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Generate a new private key from Project Settings > Service Accounts
3. Add the following environment variables to your `.env` file:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_VAPID_KEY=your_vapid_key
```

4. Generate VAPID keys for web push notifications:
   ```bash
   npx web-push generate-vapid-keys
   ```

### Testing Notifications

1. Start the development server
2. Allow notifications when prompted
3. Test different notification types:
   - Daily prompts
   - Quiz reminders
   - Achievement notifications
   - Topic-based notifications

### Notification Features

- **Opt-in Permissions**: Users must explicitly allow notifications
- **Customizable Preferences**: Users can choose which notifications to receive
- **Topic Subscriptions**: Subscribe to specific topics (e.g., "daily-prompts", "quizzes")
- **Rich Notifications**: Support for images, actions, and deep linking
- **Background Handling**: Service worker handles notifications when app is closed
- **Offline Support**: Queues notifications when offline

### Development Guidelines

1. **Sending Notifications**:
   ```typescript
   // Send to specific user
   POST /api/notifications/send
   {
     "userId": "user_id",
     "title": "New Quiz Available",
     "body": "Test your knowledge with our latest quiz!",
     "data": {
       "type": "quiz",
       "quizId": "123"
     }
   }

   // Send to topic
   POST /api/notifications/topic/send
   {
     "topic": "daily-prompts",
     "title": "Daily Prompt",
     "body": "What inspired you today?",
     "data": {
       "type": "prompt",
       "promptId": "456"
     }
   }
   ```

2. **Managing Topics**:
   ```typescript
   // Subscribe
   POST /api/notifications/topic/subscribe
   {
     "topic": "daily-prompts"
   }

   // Unsubscribe
   POST /api/notifications/topic/unsubscribe
   {
     "topic": "daily-prompts"
   }
   ```

3. **User Preferences**:
   ```typescript
   PUT /api/users/notification-preferences
   {
     "dailyPrompts": true,
     "quizzes": true,
     "achievements": false
   }
   ```

### Best Practices

1. Keep payloads small (< 4KB)
2. Handle notification clicks appropriately
3. Respect user preferences
4. Implement proper error handling
5. Test on multiple devices and browsers
6. Monitor delivery rates and engagement 

## Performance Optimizations

### Code Splitting and Lazy Loading

The application uses React's lazy loading capabilities to optimize initial load time:

```typescript
// Example of lazy loading a component
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Using the LazyLoadedComponent wrapper
<LazyLoadedComponent component={HeavyComponent} />
```

Key features:
- Automatic code splitting at the route level
- Loading spinner during component load
- Error boundary protection
- Suspense integration for smooth loading states

### Error Handling

The application uses a custom ErrorBoundary component for graceful error handling:

```typescript
// Wrapping components with ErrorBoundary
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <MyComponent />
</ErrorBoundary>
```

Features:
- Styled error messages
- Retry functionality
- Custom fallback support
- Detailed error reporting

### Performance Hooks and Memoization

The application includes several performance optimization hooks:

1. **useDebounce**:
   ```typescript
   const debouncedValue = useDebounce(value, 300);
   ```
   - Prevents excessive re-renders
   - Optimizes input handling
   - Reduces API call frequency

2. **useMemoizedCallback**:
   ```typescript
   const handleClick = useMemoizedCallback(() => {
     // handle click
   }, [dependency], skipFirstRender);
   ```
   - Enhanced version of useCallback
   - Optional first render skipping
   - Dependency tracking

3. **Component Memoization Best Practices**:
   - Use React.memo for pure functional components
   - Implement useMemo for expensive calculations
   - Apply useCallback for stable event handlers

### Implementation Guidelines

1. **When to Use Lazy Loading**:
   - Route-level components
   - Large feature modules
   - Infrequently accessed components
   - Heavy third-party components

2. **Error Boundary Placement**:
   - Route level for page errors
   - Feature level for isolated failures
   - Form level for submission errors
   - API integration boundaries

3. **Memoization Strategy**:
   - Apply to expensive calculations
   - Use for frequently re-rendered components
   - Implement for callback-heavy components
   - Consider for large lists/tables

## Progressive Web App (PWA) Features

Sparq Connection is built as a Progressive Web App, providing a native app-like experience with the following features:

### Offline Support
- **Service Worker Caching**: Core app assets and data are cached for offline use
- **Background Sync**: Changes made offline are automatically synced when connection is restored
- **Offline Indicator**: Clear visual feedback when working offline
- **Offline Page**: Custom offline page with available features list

### Installation
- **Add to Home Screen**: Install the app on any device for quick access
- **App Shell**: Fast loading with minimal initial payload
- **Automatic Updates**: Notification when new versions are available

### Performance
- **Caching Strategies**:
  - Cache-first for static assets
  - Network-first for API requests
  - Stale-while-revalidate for non-critical updates
- **Responsive Images**: Optimized image loading for different screen sizes
- **Lazy Loading**: Components and assets loaded on demand

### Push Notifications
- **Daily Prompts**: Get notified about new relationship prompts
- **Quiz Reminders**: Stay engaged with regular quiz notifications
- **Customizable**: Users can manage their notification preferences

### Data Management
- **Persistent Storage**: Important data stored locally for offline access
- **Smart Sync**: Efficient data synchronization when online
- **Cache Management**: Automatic cleanup of old caches

### Security
- **HTTPS Only**: All communications are encrypted
- **Secure Data**: Sensitive information protected in storage
- **Update Safety**: Secure update mechanism for new versions

## Development

### PWA Setup
1. **Service Worker**:
   - Located in `src/serviceWorker.ts`
   - Handles caching, offline support, and push notifications
   - Configure cache strategies in `CACHE_STRATEGIES` object

2. **Manifest**:
   - Located in `public/manifest.json`
   - Defines app metadata, icons, and themes
   - Customize appearance on home screens

3. **Components**:
   - `InstallPrompt`: Handles app installation
   - `UpdatePrompt`: Manages app updates
   - `OfflineIndicator`: Shows connection status

### Testing PWA Features
1. **Offline Testing**:
   ```bash
   # Chrome DevTools
   1. Open DevTools (F12)
   2. Go to Network tab
   3. Check "Offline" checkbox
   ```

2. **Lighthouse Audit**:
   ```bash
   # Run PWA audit
   1. Open Chrome DevTools
   2. Go to Lighthouse tab
   3. Select "Progressive Web App"
   4. Click "Generate report"
   ```

3. **Push Notifications**:
   ```bash
   # Test notifications
   1. Enable notifications in browser
   2. Use Chrome DevTools' Application tab
   3. Go to Service Workers section
   4. Click "Push" to test
   ```

### Deployment Considerations
1. **SSL Certificate**: Required for service workers and push notifications
2. **CORS Headers**: Properly configured for API requests
3. **Cache Headers**: Set appropriate cache control headers
4. **Compression**: Enable Gzip/Brotli compression
5. **Static Assets**: Use a CDN for better performance 

## Firebase Firestore Setup

### Prerequisites
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore in your project
3. Generate a new private key for service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### Environment Variables
Add the following variables to your `.env` file:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### Data Structure
Firestore collections are organized as follows:

1. `users` collection:
```typescript
{
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  isModerator: boolean;
  isAdmin: boolean;
  lastLogin: Date;
  role: 'user' | 'admin';
  stripeCustomerId?: string;
  fcmToken?: string;
  notificationPreferences: {
    dailyPrompts: boolean;
    quizzes: boolean;
    achievements: boolean;
  };
  subscription?: {
    status: string;
    planId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

2. `gamification` collection:
```typescript
{
  userId: string;
  points: number;
  current_streak: number;
  longest_streak: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  daily_responses: number;
  points_history: Array<{
    date: Date;
    points: number;
    source: string;
  }>;
  streak_history: Array<{
    date: Date;
    streak: number;
  }>;
  badges: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    earned_at: Date;
  }>;
  last_activity: Date;
  quiz_categories_completed: string[];
  mood_entries: number;
}
```

3. `promptResponses` collection:
```typescript
{
  userId: string;
  promptId: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}
```

4. `quizResponses` collection:
```typescript
{
  userId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    score: number;
  }>;
  totalScore: number;
  completedAt: Date;
}
```

5. `forumPosts` collection:
```typescript
{
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

6. `forumComments` collection:
```typescript
{
  postId: string;
  content: string;
  authorId: string;
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Migration Process
To migrate your existing data from MongoDB to Firestore:

1. Export MongoDB data:
```bash
mongoexport --db your_db --collection users --out users.json
mongoexport --db your_db --collection gamification --out gamification.json
mongoexport --db your_db --collection promptResponses --out promptResponses.json
mongoexport --db your_db --collection quizResponses --out quizResponses.json
mongoexport --db your_db --collection forumPosts --out forumPosts.json
mongoexport --db your_db --collection forumComments --out forumComments.json
```

2. Run the migration script:
```bash
node scripts/migrate-to-firestore.js
```

The migration script will:
- Transform MongoDB ObjectIDs to Firestore document IDs
- Convert date formats
- Maintain relationships between collections
- Validate data integrity during migration

### Testing
Run the test suite to verify Firestore integration:
```bash
npm test
```

### Security Rules
Set up Firestore security rules to protect your data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Gamification data
    match /gamification/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Prompt responses
    match /promptResponses/{responseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Quiz responses
    match /quizResponses/{responseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Forum posts
    match /forumPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId ||
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator;
    }
    
    // Forum comments
    match /forumComments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId ||
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator;
    }
  }
}
```

### Performance Considerations
1. **Indexing**:
   - Create composite indexes for frequently queried fields
   - Use subcollections for one-to-many relationships
   - Consider denormalization for frequently accessed data

2. **Batch Operations**:
   - Use batch writes for atomic operations
   - Implement pagination for large result sets
   - Cache frequently accessed data

3. **Cost Optimization**:
   - Minimize document reads/writes
   - Use efficient queries
   - Implement proper data structure

## Migrating from MongoDB to Firestore

### Prerequisites
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore in your project
3. Generate a new private key for service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### Environment Variables
Add the following variables to your `.env` file:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### Data Structure
Firestore collections are organized as follows:

1. `users` collection:
```typescript
{
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  isModerator: boolean;
  isAdmin: boolean;
  lastLogin: Date;
  role: 'user' | 'admin';
  stripeCustomerId?: string;
  fcmToken?: string;
  notificationPreferences: {
    dailyPrompts: boolean;
    quizzes: boolean;
    achievements: boolean;
  };
  subscription?: {
    status: string;
    planId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

2. `gamification` collection:
```typescript
{
  userId: string;
  points: number;
  current_streak: number;
  longest_streak: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  daily_responses: number;
  points_history: Array<{
    date: Date;
    points: number;
    source: string;
  }>;
  streak_history: Array<{
    date: Date;
    streak: number;
  }>;
  badges: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    earned_at: Date;
  }>;
  last_activity: Date;
  quiz_categories_completed: string[];
  mood_entries: number;
}
```

3. `promptResponses` collection:
```typescript
{
  userId: string;
  promptId: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}
```

4. `quizResponses` collection:
```typescript
{
  userId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    score: number;
  }>;
  totalScore: number;
  completedAt: Date;
}
```

5. `forumPosts` collection:
```typescript
{
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

6. `forumComments` collection:
```typescript
{
  postId: string;
  content: string;
  authorId: string;
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Migration Process
To migrate your existing data from MongoDB to Firestore:

1. Export MongoDB data:
```bash
mongoexport --db your_db --collection users --out users.json
mongoexport --db your_db --collection gamification --out gamification.json
mongoexport --db your_db --collection promptResponses --out promptResponses.json
mongoexport --db your_db --collection quizResponses --out quizResponses.json
mongoexport --db your_db --collection forumPosts --out forumPosts.json
mongoexport --db your_db --collection forumComments --out forumComments.json
```

2. Run the migration script:
```bash
node scripts/migrate-to-firestore.js
```

The migration script will:
- Transform MongoDB ObjectIDs to Firestore document IDs
- Convert date formats
- Maintain relationships between collections
- Validate data integrity during migration

### Testing
Run the test suite to verify Firestore integration:
```bash
npm test
```

### Security Rules
Set up Firestore security rules to protect your data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Gamification data
    match /gamification/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Prompt responses
    match /promptResponses/{responseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Quiz responses
    match /quizResponses/{responseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Forum posts
    match /forumPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId ||
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator;
    }
    
    // Forum comments
    match /forumComments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId ||
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator;
    }
  }
}
```

### Performance Considerations
1. **Indexing**:
   - Create composite indexes for frequently queried fields
   - Use subcollections for one-to-many relationships
   - Consider denormalization for frequently accessed data

2. **Batch Operations**:
   - Use batch writes for atomic operations
   - Implement pagination for large result sets
   - Cache frequently accessed data

3. **Cost Optimization**:
   - Minimize document reads/writes
   - Use efficient queries
   - Implement proper data structure

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Rule-Based Content Personalization

The app uses a rule-based system to personalize prompts and quizzes based on user behavior and preferences.

### How It Works

1. **User Preferences**:
   - Topic preferences calculated from past responses and quiz performance
   - Difficulty level adjusted based on quiz scores and engagement
   - Response frequency tracked for engagement measurement
   - Recent topics stored to avoid repetition

2. **Personalization Rules**:
   - Content matched to user's top 3 preferred topics
   - Difficulty level (1-5) determined by:
     - Average quiz scores
     - Response frequency
     - Current streak length
   - Performance bonuses for high quiz scores
   - Topic variety ensured by tracking recent topics

3. **Implementation Details**:
   ```typescript
   // Example user preferences structure
   {
     userId: string;
     topicPreferences: {
       [topic: string]: number; // 0-1 engagement score
     };
     difficultyLevel: number; // 1-5
     responseFrequency: number;
     lastTopics: string[];
     updatedAt: Date;
   }
   ```

### Testing Personalization

1. **Setup Test Data**:
   ```bash
   # Create test responses
   curl -X POST http://localhost:5000/api/prompts/response \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"promptId": "123", "response": "test"}'

   # Complete test quiz
   curl -X POST http://localhost:5000/api/quizzes/submit \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"quizId": "456", "answers": [...]}'
   ```

2. **View Personalized Content**:
   ```bash
   # Get personalized prompts and quizzes
   curl http://localhost:5000/api/personalized-content \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Get only prompts
   curl http://localhost:5000/api/personalized-content?type=prompt \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Run Tests**:
   ```bash
   cd server
   npm test src/__tests__/personalizationService.test.ts
   ```

### Performance Considerations

1. **Caching**:
   - User preferences cached in Firestore
   - Preferences updated after significant changes
   - Content queries optimized with proper indexes

2. **Efficiency**:
   - Limited to top 3 topics for content matching
   - Maximum 5 prompts and 3 quizzes per request
   - Batch operations for preference updates

3. **Monitoring**:
   - Track preference calculation time
   - Monitor content relevance scores
   - Measure user engagement with personalized content 

## Testing the Journey Feature

The Journey feature includes comprehensive test coverage for both backend and frontend components. Here's how to run and understand the tests:

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Backend Tests (`server/src/__tests__/journeys.test.ts`)

The backend tests cover the Journey API endpoints:

- `GET /journeys`: Tests fetching all available journeys
- `GET /journeys/:id`: Tests retrieving specific journey details
- `POST /journeyProgress`: Tests saving user reflections and progress

The tests use Jest mocks to simulate Firestore interactions:

```typescript
jest.mock('../services/firestore', () => ({
  db: {
    collection: jest.fn(),
  },
}));
```

### Frontend Tests (`client/src/components/__tests__/Journey.test.tsx`)

The frontend tests use React Testing Library to verify the Journey component's functionality:

1. **Basic Rendering**
   - Journey title and description display
   - Loading states
   - Error handling

2. **Journey Steps**
   - Begin step initial render
   - Share step navigation and activity display
   - Reflect step form validation
   - Align step completion display

3. **Progress Tracking**
   - Current day progress display
   - Completed days visualization
   - Reflection submission

Example test for submitting a reflection:

```typescript
it('navigates to Reflect step and submits reflection', async () => {
  render(<Journey journeyId="journey1" />);
  
  // Navigate to reflection step
  fireEvent.click(screen.getByText('Start Day 1'));
  fireEvent.click(screen.getByText('Continue to Reflection'));
  
  // Submit reflection
  const input = screen.getByPlaceholderText('Share your thoughts...');
  await userEvent.type(input, 'This was a great experience!');
  fireEvent.click(screen.getByText('Submit Reflection'));
  
  expect(mockUpdateProgress).toHaveBeenCalled();
});
```

### Test Coverage Requirements

We maintain high test coverage for the Journey feature:

- Minimum 80% line coverage
- 100% coverage of critical paths (reflection submission, progress tracking)
- All error states and edge cases tested

To view detailed coverage reports:

1. Run `npm run test:coverage`
2. Open `coverage/lcov-report/index.html` in your browser

### Writing New Tests

When adding new Journey features:

1. Add backend tests for any new API endpoints
2. Add frontend tests for new UI components
3. Include both happy path and error cases
4. Mock external dependencies (Firestore, Auth)
5. Test user interactions using React Testing Library
6. Verify progress tracking and data persistence

## Deployment

### Frontend Deployment (Vercel)

1. **Prerequisites**:
   - Create a [Vercel](https://vercel.com) account
   - Install Vercel CLI: `npm i -g vercel`

2. **Configure Environment Variables**:
   - Go to your Vercel project settings
   - Add the following environment variables:
     ```
     REACT_APP_API_URL=https://your-render-app.onrender.com
     REACT_APP_FIREBASE_CONFIG=your-firebase-config
     ```

3. **Deploy**:
   ```bash
   # Login to Vercel
   vercel login

   # Navigate to frontend directory
   cd client

   # Deploy to production
   vercel --prod
   ```

4. **Custom Domain (Optional)**:
   - Go to your Vercel project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

### Backend Deployment (Render)

1. **Prerequisites**:
   - Create a [Render](https://render.com) account
   - Connect your GitHub repository

2. **Configure Environment Variables**:
   - Go to your Render dashboard
   - Create a new Web Service
   - Add the following environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your-mongodb-uri
     JWT_SECRET=your-jwt-secret
     CLIENT_URL=https://your-vercel-app.vercel.app
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-client-email
     FIREBASE_PRIVATE_KEY=your-private-key
     FIREBASE_API_KEY=your-api-key
     FIREBASE_AUTH_DOMAIN=your-auth-domain
     FIREBASE_STORAGE_BUCKET=your-storage-bucket
     FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     FIREBASE_APP_ID=your-app-id
     FIREBASE_MEASUREMENT_ID=your-measurement-id
     FIREBASE_ADMIN_SDK_KEY=your-admin-sdk-key
     ```

3. **Deploy**:
   - Select your repository
   - Choose the `main` branch
   - Select "Node" as the environment
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Click "Create Web Service"

4. **Monitoring**:
   - Monitor your app's health at: `https://your-app.onrender.com/api/health`
   - View logs in the Render dashboard
   - Set up alerts for downtime (optional)

### Free Tier Limitations

#### Vercel Free Tier:
- Serverless function execution: 10s timeout
- Builds: 100 per day
- Bandwidth: 100GB per month
- No custom domain SSL configuration required
- Automatic HTTPS/SSL certificates

#### Render Free Tier:
- Instance: Shared CPU, 512MB RAM
- Bandwidth: 100GB per month
- Build minutes: 400 per month
- Spins down after 15 minutes of inactivity
- Automatic HTTPS/SSL certificates

### Best Practices

1. **Environment Variables**:
   - Never commit sensitive data to version control
   - Use separate variables for development and production
   - Regularly rotate secrets and API keys

2. **Performance**:
   - Optimize bundle size for faster loading
   - Enable caching where possible
   - Use CDN for static assets
   - Implement lazy loading for routes

3. **Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor API response times
   - Track resource usage

4. **Security**:
   - Enable CORS with specific origins
   - Set secure headers
   - Rate limit API endpoints
   - Keep dependencies updated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Rule-Based Content Personalization

The app uses a rule-based system to personalize prompts and quizzes based on user behavior and preferences.

### How It Works

1. **User Preferences**:
   - Topic preferences calculated from past responses and quiz performance
   - Difficulty level adjusted based on quiz scores and engagement
   - Response frequency tracked for engagement measurement
   - Recent topics stored to avoid repetition

2. **Personalization Rules**:
   - Content matched to user's top 3 preferred topics
   - Difficulty level (1-5) determined by:
     - Average quiz scores
     - Response frequency
     - Current streak length
   - Performance bonuses for high quiz scores
   - Topic variety ensured by tracking recent topics

3. **Implementation Details**:
   ```typescript
   // Example user preferences structure
   {
     userId: string;
     topicPreferences: {
       [topic: string]: number; // 0-1 engagement score
     };
     difficultyLevel: number; // 1-5
     responseFrequency: number;
     lastTopics: string[];
     updatedAt: Date;
   }
   ```

### Testing Personalization

1. **Setup Test Data**:
   ```bash
   # Create test responses
   curl -X POST http://localhost:5000/api/prompts/response \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"promptId": "123", "response": "test"}'

   # Complete test quiz
   curl -X POST http://localhost:5000/api/quizzes/submit \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"quizId": "456", "answers": [...]}'
   ```

2. **View Personalized Content**:
   ```bash
   # Get personalized prompts and quizzes
   curl http://localhost:5000/api/personalized-content \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Get only prompts
   curl http://localhost:5000/api/personalized-content?type=prompt \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Run Tests**:
   ```bash
   cd server
   npm test src/__tests__/personalizationService.test.ts
   ```

### Performance Considerations

1. **Caching**:
   - User preferences cached in Firestore
   - Preferences updated after significant changes
   - Content queries optimized with proper indexes

2. **Efficiency**:
   - Limited to top 3 topics for content matching
   - Maximum 5 prompts and 3 quizzes per request
   - Batch operations for preference updates

3. **Monitoring**:
   - Track preference calculation time
   - Monitor content relevance scores
   - Measure user engagement with personalized content 

## Journey Analytics Tools

The application includes tools for analyzing journey interaction logs to understand user engagement patterns.

### Command Line Analysis

Run the analysis script directly to view journey statistics:

```bash
# Analyze last 30 days (default)
npx ts-node server/src/scripts/analyzeJourneyLogs.ts

# Analyze specific number of days
npx ts-node server/src/scripts/analyzeJourneyLogs.ts 7  # Last 7 days
```

### API Endpoint

Access journey statistics through the admin API endpoint:

```bash
# Get JSON format (default)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/journeyStats

# Get text report format
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/journeyStats?format=text

# Specify days to analyze
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/journeyStats?days=7
```

### Analytics Features

The analytics tools provide insights into:

1. **Overall Statistics**
   - Total journeys started and completed
   - Completion rates
   - Total days completed
   - Average reflection length

2. **User Engagement**
   - Active user count
   - Most active users
   - User completion rates
   - Average reflection lengths per user

3. **Journey Performance**
   - Start and completion counts per journey
   - Completion rates by journey
   - Reflection submission rates
   - Popular journey types

4. **Time Analysis**
   - Peak activity hours
   - User engagement patterns
   - Daily completion trends

### Security Considerations

1. **Access Control**
   - Analytics endpoint requires admin privileges
   - JWT authentication required
   - Rate limiting applied to prevent abuse

2. **Data Privacy**
   - User IDs are hashed in logs
   - No personal data included in reports
   - Aggregate statistics prioritized

3. **Performance**
   - Efficient log parsing
   - Results cached for 1 hour
   - Configurable analysis timeframe

### Best Practices

1. **Regular Analysis**
   - Monitor completion rates weekly
   - Track user engagement patterns
   - Identify popular content
   - Review peak usage times

2. **Data Retention**
   - Logs rotated every 14 days
   - Historical data archived
   - Regular cleanup of old logs

3. **Optimization**
   - Index logs by date
   - Batch process large logs
   - Cache frequent queries

## Journey Dashboard

The Journey Dashboard provides users with a comprehensive overview of their progress across all "Path to Together" journeys.

### Features

1. **Progress Overview**:
   - Visual progress bars for each journey
   - Days completed vs. total days
   - Current day indicator
   - Last activity timestamps

2. **Journey Cards**:
   - Journey title and description
   - Progress visualization
   - Status indicators (In Progress/Completed)
   - Quick access to continue or review journeys

3. **Responsive Design**:
   - Grid layout adapts to screen size
   - Mobile-friendly interface
   - Smooth animations and transitions
   - Accessible progress indicators

### Usage

Access the Journey Dashboard through:
```typescript
// Route configuration
<Route path="/journeys/dashboard" component={JourneyDashboard} />

// Navigation
<Link to="/journeys/dashboard">View Progress</Link>
```

### API Endpoints

#### GET /api/journeys/userProgress
Returns progress data for all user's journeys.

Response format:
```json
{
  "success": true,
  "data": [
    {
      "journeyId": "journey1",
      "title": "5 Love Languages",
      "description": "Discover your love language",
      "totalDays": 5,
      "completedDays": 3,
      "currentDay": 4,
      "startedAt": "2024-03-17T00:00:00.000Z",
      "lastActivity": "2024-03-19T00:00:00.000Z",
      "isComplete": false
    }
  ]
}
```

### Testing

1. **Component Tests**:
   ```bash
   # Run Journey Dashboard tests
   npm test src/components/__tests__/JourneyDashboard.test.tsx
   ```

2. **API Tests**:
   ```bash
   # Run journey controller tests
   npm test src/controllers/journeyController.test.ts
   ```

### Best Practices

1. **Performance**:
   - Efficient progress calculations
   - Optimized API queries
   - Lazy loading of journey details
   - Caching of progress data

2. **User Experience**:
   - Clear progress indicators
   - Intuitive navigation
   - Responsive feedback
   - Smooth animations

3. **Accessibility**:
   - ARIA labels for progress bars
   - Keyboard navigation support
   - High contrast visual indicators
   - Screen reader compatibility

## Journey Guidance Feature

The Journey feature includes in-app guidance through tooltips to help users understand each step of their journey:

### Step-by-Step Guidance

1. **Begin Step**
   - Introduction to the day's theme
   - Set your intention for the day
   - Clear guidance on starting your journey

2. **Share Step**
   - Overview of daily activities
   - Instructions for partner engagement
   - Activity-specific guidance

3. **Reflect Step**
   - Structured reflection prompts
   - Space for personal thoughts
   - Guidance on meaningful reflection

4. **Align Step**
   - Progress review
   - Preparation for next day
   - Celebration of completion

5. **Daily Focus Activity**
   - Mindfulness exercises
   - Connection strengthening activities
   - Guided practice instructions

### Accessibility Features

- Screen reader compatible tooltips
- Keyboard navigation support
- High contrast visual indicators
- Clear ARIA labels
- Focus management
- Semantic HTML structure

### User Experience

- Unobtrusive tooltips with 500ms delay
- Clear, concise instructions
- Progressive disclosure of information
- Smooth transitions between steps
- Visual progress indicators
- Mobile-responsive design

### Technical Implementation

```typescript
// Tooltip implementation using Material-UI
<Tooltip
  title="Start your day with an introduction to today's theme"
  placement="top"
  arrow
  enterDelay={500}
>
  <Button>Begin Journey</Button>
</Tooltip>
```

### Testing

The Journey guidance feature includes comprehensive testing:
- Unit tests for tooltip rendering
- Accessibility testing
- User interaction testing
- Responsive design testing
- Screen reader compatibility

Run the tests:
```bash
# Run journey component tests
npm test src/components/__tests__/Journey.test.tsx
```

## Environment Variables Setup

The application uses environment variables for configuration. Follow these steps to set up your environment:

1. Copy `.env.template` to create your own `.env` file:
   ```bash
   cp .env.template .env
   ```

2. Fill in the values in your `.env` file:

### Required Variables

#### Environment Configuration
- `NODE_ENV`: Set to 'development', 'production', or 'test'
- `PORT`: The port number for the server (default: 3000)
- `API_URL`: The base URL for the API
- `CLIENT_URL`: The base URL for the client application

#### Database Configuration
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string for caching

#### Firebase Configuration
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID
- `FIREBASE_ADMIN_SDK_KEY`: Your Firebase admin SDK key

#### Frontend Environment Variables
These are automatically set based on other environment variables. No manual configuration needed.

#### Stripe Configuration (Optional - for payment processing)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

#### Sanity Configuration (Optional - for content management)
- `SANITY_PROJECT_ID`: Your Sanity project ID
- `SANITY_DATASET`: Your Sanity dataset name
- `SANITY_TOKEN`: Your Sanity API token

#### SendGrid Configuration (Optional - for email notifications)
- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDGRID_FROM_EMAIL`: Verified sender email address

#### Twilio Configuration (Optional - for SMS notifications)
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

#### Admin Configuration
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Admin user password

#### Development Configuration
- `DEBUG`: Set to 'true' for detailed logging
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

#### Testing Configuration
- `TEST_USER_EMAIL`: Test user email for automated tests
- `TEST_USER_PASSWORD`: Test user password for automated tests

### Security Notes

1. Never commit your `.env` file to version control
2. Use strong, unique values for secrets and passwords
3. Rotate sensitive credentials regularly
4. Use different values for development, staging, and production environments

### Deployment

For deployment, set the environment variables in your hosting platform's configuration:

- Vercel: Use the Environment Variables section in your project settings
- Render: Use the Environment Variables section in your service settings
- Docker: Pass environment variables using the `-e` flag or a `docker-compose.yml` file

## Testing Setup with CRACO

The project uses CRACO (Create React App Configuration Override) to customize the Jest configuration without ejecting from Create React App.

### CRACO Configuration

The Jest configuration is managed through `craco.config.js`:

```javascript
module.exports = {
  jest: {
    configure: {
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': 'jest-transform-stub',
        '^.+\\.(jpg|jpeg|png|gif|webp|svg|ico)$': 'jest-transform-stub'
      },
      setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
      ]
    }
  }
};
```

### Key Features

1. **Custom Test Environment**:
   - Uses `jest-environment-jsdom` for DOM simulation
   - Configured for React 18+ compatibility
   - Supports modern JavaScript features

2. **Enhanced Module Resolution**:
   - Alias support (`@/` for src directory)
   - CSS/SCSS module handling
   - Image and SVG imports
   - Static file transformations

3. **Test Setup**:
   - Global Jest DOM matchers
   - MSW for API mocking
   - Browser API mocks (IntersectionObserver, matchMedia)
   - Styled-components support

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific tests
npm test -- MyComponent.test.tsx
```

### Test File Organization

```
src/
├── __tests__/        # Global test files
├── components/
│   └── __tests__/    # Component-specific tests
├── hooks/
│   └── __tests__/    # Hook tests
└── utils/
    └── __tests__/    # Utility function tests
```

### MSW (Mock Service Worker) Setup

The project uses MSW for API mocking in tests:

```typescript
// src/mocks/handlers.ts
export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ user: mockUser });
  }),
  // ... other handlers
];

// src/setupTests.ts
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Coverage Requirements

- Minimum 80% coverage for:
  - Branches
  - Functions
  - Lines
  - Statements

### Best Practices

1. **Test Organization**:
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**:
   - Use MSW for API mocks
   - Mock browser APIs when needed
   - Keep mocks simple and focused

3. **Coverage**:
   - Maintain minimum coverage requirements
   - Focus on critical paths
   - Document uncovered edge cases

## End-to-End Testing with Playwright

The application uses Playwright for comprehensive end-to-end testing of key user journeys.

### Test Coverage

1. **Authentication Flow**
   - User signup process
   - Login functionality
   - Password reset flow
   - Error handling

2. **Journey Feature**
   - Starting a new journey
   - Completing daily activities
   - Submitting reflections
   - Progress tracking

### Running E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e auth.spec.ts

# Run tests with UI mode
npm run test:e2e -- --ui
```

## Accessibility Enhancements

### Focus Management

The application implements comprehensive focus management using custom hooks:

```typescript
const { elementRef, handleFocus, handleBlur } = useFocusManagement({
  shouldFocus: true,
  focusOnMount: true
});
```

### ARIA Attributes

- Proper ARIA labels and descriptions
- Role assignments
- Live regions for dynamic content
- Focus trap for modals
- Keyboard navigation support

### Screen Reader Support

- Announcements for dynamic content
- Semantic HTML structure
- Alternative text for images
- Clear heading hierarchy
- Skip navigation links

## Security Measures

### Content Security Policy (CSP)

The application implements a strict CSP to prevent XSS and other injection attacks:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.example.com']
  }
}
```

### CSRF Protection

- CSRF tokens for all state-changing requests
- Secure cookie configuration
- Token validation middleware
- Error handling for invalid tokens

### Rate Limiting

```javascript
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Additional Security Headers

- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Feature-Policy

## Development Guidelines

### Testing Best Practices

1. **Unit Tests**
   - Test individual components
   - Mock external dependencies
   - Focus on business logic

2. **Integration Tests**
   - Test component interactions
   - API integration testing
   - State management testing

3. **E2E Tests**
   - Critical user journeys
   - Cross-browser testing
   - Mobile responsiveness

### Accessibility Guidelines

1. **Semantic HTML**
   - Use appropriate elements
   - Maintain heading hierarchy
   - Implement ARIA when needed

2. **Keyboard Navigation**
   - Focus management
   - Skip links
   - Focus indicators

3. **Screen Readers**
   - Descriptive labels
   - Alternative text
   - Meaningful announcements

### Security Guidelines

1. **Input Validation**
   - Sanitize user input
   - Validate data types
   - Prevent injection attacks

2. **Authentication**
   - Secure password storage
   - Token management
   - Session handling

3. **API Security**
   - Rate limiting
   - CORS configuration
   - Error handling

## Storybook Documentation

The project uses Storybook for component development and documentation. Storybook provides an isolated environment to develop and test UI components.

### Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook for deployment
npm run build-storybook
```

### Available Stories

1. **Components**
   - LoadingSpinner: Loading indicator with customizable size and color
   - ErrorBoundary: Error handling component with fallback UI
   - Form inputs and buttons (coming soon)

### Storybook Addons

- **@storybook/addon-essentials**: Core addons for development
- **@storybook/addon-a11y**: Accessibility testing
- **@storybook/addon-controls**: Dynamic controls for component props
- **storybook-addon-react-router-v6**: Router context for components

## Error Tracking with Sentry

The application uses Sentry for error tracking and monitoring in production.

### Sentry Setup

1. Create a Sentry account and project at [sentry.io](https://sentry.io)
2. Add your Sentry DSN to the environment variables:
   ```
   REACT_APP_SENTRY_DSN=your-sentry-dsn
   ```

### Error Handling

The application includes several layers of error handling:

1. **Global Error Boundary**
   - Catches React component errors
   - Reports errors to Sentry
   - Displays user-friendly fallback UI

2. **API Error Handling**
   - Captures and reports API errors
   - Provides meaningful error messages
   - Handles network failures gracefully

3. **Performance Monitoring**
   - Tracks page load times
   - Monitors API response times
   - Reports browser performance metrics

### Sentry Features

- Automatic error capturing
- Custom error context
- User session tracking
- Performance monitoring
- Release tracking
- Environment separation

### Best Practices

1. **Error Reporting**
   - Include relevant context
   - Sanitize sensitive data
   - Group similar errors
   - Set appropriate sampling rates

2. **Monitoring**
   - Review error trends
   - Set up alerts
   - Track error resolution
   - Monitor performance impact

## Known Issues / Fixes

### Theme Configuration
- Added missing color definitions to theme.ts including 'secondary-dark', 'warning', and 'info'
- Properly typed theme interface to ensure type safety
- Extended DefaultTheme from styled-components for better TypeScript support

### Case Sensitivity
- Fixed case sensitivity issue with Journey component by moving it to the lowercase journey directory
- Ensure all imports use the correct case: `import { Journey } from '../journey/Journey'`

### Dependencies
- MSW (Mock Service Worker) installed for testing
- Sentry integration added with known TypeScript issues:
  - BrowserTracing type compatibility with Integration interface needs resolution
  - Current workaround: Using type assertion (not ideal)
  - Consider upgrading Sentry packages if issues persist

### Development Guidelines
1. Use consistent file naming:
   - Components: PascalCase (e.g., `Button.tsx`)
   - Directories: lowercase (e.g., `components/journey/`)
   - Test files: ComponentName.test.tsx

2. Theme Usage:
   - Import colors from theme.ts
   - Use theme context in styled-components
   - Available colors: primary, secondary, warning, info, etc.

3. Error Handling:
   - Use Sentry.captureException for error tracking
   - Implement error boundaries for component-level error handling
   - Log errors appropriately in development

### Running the Application
1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Set up environment variables:
   - Copy .env.template to .env
   - Fill in required values

3. Start development server:
   ```bash
   npm run dev
   ```

4. Known startup issues:
   - TypeScript errors with Sentry integration
   - Case sensitivity in import paths
   - Theme type definitions

# SparqConnection App Fixes

## Recent Fixes and Updates

### 1. Theme Issues
- ✅ Verified theme.ts structure
- ✅ All required colors exist in theme.colors
- ✅ Theme is properly exported as default export
- ✅ No missing color references
- ✅ Verified Button.tsx color references are correct

### 2. TypeScript Types
- ✅ Created types/activity.ts with ActivitySummary interface
- ✅ Created types/journey.ts with JourneyProgress and JourneyDay interfaces
- ✅ Created types/user.ts with User interface and required fields
- ✅ Verified Button.tsx type definitions

### 3. Missing & Incorrect Imports
- ✅ Created hooks/useJourney.ts with basic functionality
- ✅ Created contexts/JourneyContext.tsx with provider implementation
- ✅ Created utils/encryption.ts with secure methods
- [ ] Verifying component files

### 4. Case Sensitivity Issues
#### In Progress:
- [ ] Fixing component file naming
- [ ] Updating import statements

### 5. React & State Issues
#### In Progress:
- [ ] Fixing AnimatePresence conditionals
- [ ] Adding user.uid null checks
- [ ] Updating JourneyDay type definition

### 6. Third-Party Dependencies
#### In Progress:
- [ ] Installing msw and types
- [ ] Fixing Sentry imports

### 7. Final Steps
#### In Progress:
- [ ] Running lint checks
- [ ] Running build process
- [ ] Testing app startup
- [ ] Verifying all fixes

## Progress Updates
### Completed Tasks:
1. Created and verified all required TypeScript interfaces
2. Implemented JourneyContext with proper type safety
3. Created useJourney hook with TypeScript support
4. Verified theme structure and color definitions
5. Implemented secure encryption utilities
6. Verified Button component styling and types

### Next Steps:
1. Fix case sensitivity issues in component files
2. Address React state and conditional rendering issues
3. Install and configure third-party dependencies
4. Run final checks and tests

### Security Improvements:
1. Implemented AES-GCM encryption using Web Crypto API
2. Added secure key generation and password-based key derivation
3. Implemented secure hashing and verification methods
4. Added proper error handling for cryptographic operations