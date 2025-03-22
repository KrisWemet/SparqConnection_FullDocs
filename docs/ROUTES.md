# Journey Routes and Firestore Structure

## API Routes

### Journey Routes (`/api/journeys`)

#### GET /api/journeys
- **Description**: Get all available journeys
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "duration": "number",
        "category": "string"
      }
    ]
  }
  ```

#### GET /api/journeys/:id
- **Description**: Get specific journey by ID with user's progress
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "duration": "number",
      "days": [
        {
          "day": "number",
          "title": "string",
          "content": "string",
          "activities": ["string"]
        }
      ],
      "progress": {
        "currentDay": "number",
        "reflections": {
          "dayNumber": {
            "reflection": "string",
            "completed": "boolean",
            "timestamp": "Date"
          }
        }
      }
    }
  }
  ```

#### GET /api/journeys/user/progress
- **Description**: Get user's progress for all journeys
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "journeyId": "string",
        "title": "string",
        "description": "string",
        "totalDays": "number",
        "completedDays": "number",
        "currentDay": "number",
        "startedAt": "Date",
        "lastActivity": "Date",
        "isComplete": "boolean"
      }
    ]
  }
  ```

### Journey Progress Routes (`/api/journey-progress`)

#### POST /api/journey-progress/start
- **Description**: Start a new journey
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "journeyId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Journey started successfully"
  }
  ```

#### POST /api/journey-progress/update
- **Description**: Update journey progress with reflection
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "journeyId": "string",
    "day": "number",
    "reflection": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Progress updated successfully"
  }
  ```

## Firestore Structure

### Collections

#### `journeys`
```typescript
{
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  days: {
    day: number;
    title: string;
    content: string;
    activities: string[];
  }[];
}
```

#### `users/{userId}/journeyProgress`
```typescript
{
  journeyId: string;
  dayNumber: number;
  reflections: {
    [dayNumber: string]: {
      reflection: string; // Encrypted
      completed: boolean;
      timestamp: Date;
      partnerSyncStatus: 'pending' | 'synced' | 'failed';
    };
  };
  startedAt: Date;
  completedAt?: Date;
  lastActivity: Date;
}
```

#### `messages/{userId}/{partnerId}`
```typescript
{
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  journeyId?: string;
  dayNumber?: number;
  timestamp: Date;
  read: boolean;
}
```

### Example Journey Data

Here are 10 predefined journeys for initialization:

1. "5 Love Languages" (5 days)
   - Understanding Words of Affirmation
   - Acts of Service in Daily Life
   - Receiving Gifts Mindfully
   - Quality Time Together
   - Physical Touch and Connection

2. "Building Trust" (7 days)
   - Foundation of Trust
   - Open Communication
   - Setting Boundaries
   - Keeping Commitments
   - Forgiveness Practice
   - Vulnerability Exercise
   - Trust Reflection

3. "Emotional Intelligence" (5 days)
   - Self-Awareness
   - Managing Emotions
   - Understanding Partner's Feelings
   - Empathy Building
   - Emotional Connection

4. "Conflict Resolution" (6 days)
   - Understanding Conflict Styles
   - Active Listening
   - Expressing Needs
   - Finding Solutions
   - Making Agreements
   - Moving Forward

5. "Intimacy & Connection" (5 days)
   - Emotional Intimacy
   - Intellectual Connection
   - Spiritual Bond
   - Physical Intimacy
   - Shared Vision

6. "Mindful Relationship" (4 days)
   - Present Moment Awareness
   - Mindful Communication
   - Gratitude Practice
   - Shared Meditation

7. "Growing Together" (6 days)
   - Individual Goals
   - Shared Dreams
   - Supporting Growth
   - Overcoming Challenges
   - Celebrating Success
   - Future Planning

8. "Daily Appreciation" (3 days)
   - Gratitude Expression
   - Acts of Kindness
   - Celebration of Love

9. "Deep Understanding" (5 days)
   - Childhood & Background
   - Values & Beliefs
   - Hopes & Dreams
   - Fears & Concerns
   - Love Maps

10. "Shared Purpose" (4 days)
    - Finding Common Ground
    - Creating Shared Goals
    - Building Traditions
    - Legacy Planning

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Journey collection
    match /journeys/{journeyId} {
      allow read: if request.auth != null;
    }
    
    // User's journey progress
    match /users/{userId}/journeyProgress/{progressId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Messages between partners
    match /messages/{userId}/{partnerId}/{messageId} {
      allow read: if request.auth.uid in [userId, partnerId];
      allow write: if request.auth.uid == request.resource.data.senderId
                  && request.auth.uid in [userId, partnerId];
    }
  }
}
``` 