# Sparq Connection Content Documentation

## Content Structure

The Sparq Connection platform uses Firestore to manage dynamic content for journeys, quizzes, and communication prompts.

### Data Models

#### Journey
```typescript
interface Journey {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  imageUrl: string;
  days: JourneyDay[];
  completionCount: number;
  averageRating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Journey Day
```typescript
interface JourneyDay {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  order: number;
}
```

#### Activity
```typescript
interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'reflection' | 'action' | 'meditation';
  duration: number;
  resources?: string[];
  order: number;
}
```

#### Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  imageUrl: string;
  completionCount: number;
  averageScore: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
  order: number;
}

interface QuizOption {
  id: string;
  text: string;
  score?: number;
}
```

#### Prompt
```typescript
interface Prompt {
  id: string;
  text: string;
  category: string;
  description: string;
  suggestedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  imageUrl: string;
  responseCount: number;
  favoriteCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PromptResponse {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}
```

### Available Journeys

1. **5 Love Languages** (7 days)
   - Understanding love languages
   - Quality time exploration
   - Words of affirmation practice
   - Acts of service awareness
   - Physical touch boundaries
   - Receiving gifts mindfully
   - Integration and practice

2. **Mindful Communication** (7 days)
   - Active listening basics
   - Non-verbal communication
   - Emotional awareness
   - Conflict resolution
   - Empathetic response
   - Clear expression
   - Practice and reflection

3. **Building Trust** (7 days)
   - Trust foundations
   - Vulnerability practice
   - Boundary setting
   - Consistency building
   - Forgiveness work
   - Reliability exercises
   - Trust maintenance

4. **Emotional Intelligence** (7 days)
   - Self-awareness
   - Emotion regulation
   - Social awareness
   - Relationship management
   - Empathy building
   - Stress management
   - Integration

5. **Conflict Resolution** (7 days)
   - Understanding conflict
   - Communication skills
   - Problem-solving
   - Compromise strategies
   - Emotional management
   - Resolution practice
   - Maintenance

6. **Intimacy Building** (7 days)
   - Emotional connection
   - Physical boundaries
   - Communication practice
   - Trust exercises
   - Vulnerability work
   - Shared experiences
   - Integration

7. **Shared Goals** (7 days)
   - Vision alignment
   - Goal setting
   - Action planning
   - Progress tracking
   - Obstacle management
   - Celebration practice
   - Future planning

8. **Relationship Repair** (7 days)
   - Damage assessment
   - Communication repair
   - Trust rebuilding
   - Forgiveness work
   - New patterns
   - Growth mindset
   - Moving forward

9. **Partner Support** (7 days)
   - Understanding needs
   - Active support
   - Emotional presence
   - Practical help
   - Crisis management
   - Growth support
   - Mutual care

10. **Long-term Success** (7 days)
    - Commitment practice
    - Growth mindset
    - Shared values
    - Future planning
    - Relationship maintenance
    - Challenge management
    - Celebration

### Available Quizzes

1. **Love Languages Assessment** (5 questions)
   - Understanding your primary love language
   - Identifying partner's love language
   - Communication preferences
   - Emotional expression styles
   - Love language conflicts

2. **Communication Style Quiz** (5 questions)
   - Active listening assessment
   - Conflict resolution approach
   - Non-verbal communication
   - Emotional expression
   - Communication under stress

3. **Trust Building Evaluation** (5 questions)
   - Trust foundations
   - Vulnerability comfort level
   - Boundary setting
   - Past experiences impact
   - Trust recovery strategies

4. **Emotional Intelligence Check** (5 questions)
   - Self-awareness level
   - Empathy assessment
   - Emotional regulation
   - Social awareness
   - Relationship management

5. **Conflict Resolution Style** (5 questions)
   - Conflict approach
   - Problem-solving methods
   - Emotional management
   - Compromise willingness
   - Resolution strategies

6. **Intimacy Comfort Assessment** (5 questions)
   - Emotional intimacy
   - Physical boundaries
   - Trust and vulnerability
   - Communication comfort
   - Intimacy expectations

7. **Goal Alignment Check** (5 questions)
   - Future vision
   - Priority assessment
   - Shared values
   - Growth mindset
   - Support methods

8. **Relationship Values Quiz** (5 questions)
   - Core values
   - Deal breakers
   - Lifestyle preferences
   - Future aspirations
   - Compromise areas

9. **Support Style Assessment** (5 questions)
   - Support preferences
   - Crisis response
   - Emotional availability
   - Practical help style
   - Growth encouragement

10. **Relationship Readiness Check** (5 questions)
    - Emotional availability
    - Commitment readiness
    - Past relationship impact
    - Current life stability
    - Relationship expectations

### Available Prompts

1. **Appreciation Expressions** (5 prompts)
   - Share a recent moment when your partner made you feel valued
   - Describe three qualities you admire most about your partner
   - Recall a time your partner went above and beyond for you
   - Express gratitude for a small, daily action your partner does
   - Write a letter of appreciation about your relationship journey

2. **Deep Connection** (5 prompts)
   - What are your hopes and dreams for our relationship?
   - Share a fear or insecurity you've never discussed before
   - Describe a childhood memory that shaped who you are
   - What does true partnership mean to you?
   - Discuss a time you felt most connected to each other

3. **Growth & Learning** (5 prompts)
   - What have you learned about yourself through our relationship?
   - Share a challenge that helped us grow stronger together
   - How has your perspective on love evolved?
   - Discuss a mistake that taught you something valuable
   - What new skills or habits have you developed through our relationship?

4. **Future Vision** (5 prompts)
   - Where do you see us in five years?
   - What shared goals would you like to achieve together?
   - How do you envision balancing personal and relationship growth?
   - What traditions would you like to create together?
   - Describe your ideal shared lifestyle

5. **Conflict Resolution** (5 prompts)
   - Share a productive way we've handled disagreements
   - What helps you feel heard during difficult conversations?
   - Describe your ideal approach to solving problems together
   - What triggers do you wish your partner understood better?
   - How can we better support each other during conflicts?

6. **Intimacy Building** (5 prompts)
   - What makes you feel most emotionally connected?
   - Share a moment when you felt completely understood
   - How can we create more meaningful quality time?
   - What gestures make you feel especially loved?
   - Describe your ideal level of emotional closeness

7. **Trust & Security** (5 prompts)
   - What actions build trust for you in our relationship?
   - Share a time when you felt completely safe being vulnerable
   - How can we strengthen our foundation of trust?
   - What boundaries help you feel secure?
   - Describe what loyalty means to you

8. **Shared Values** (5 prompts)
   - What core values do you want to build our relationship on?
   - How do our different backgrounds enrich our relationship?
   - What principles guide your decision-making?
   - Share a value you've adopted from your partner
   - How can we better align our priorities?

9. **Fun & Adventure** (5 prompts)
   - What new experiences would you like to share together?
   - Describe your idea of a perfect day together
   - What activities make you feel most playful?
   - Share a memorable adventure you'd like to recreate
   - How can we add more spontaneity to our relationship?

10. **Support & Understanding** (5 prompts)
    - How do you prefer to be supported during difficult times?
    - What helps you feel understood when sharing feelings?
    - Describe your ideal emotional support system
    - Share a time when you felt perfectly supported
    - How can we better anticipate each other's needs?

## Firestore Structure

```
journeys/
  ├── {journeyId}/
  │   ├── title
  │   ├── description
  │   ├── category
  │   ├── duration
  │   ├── difficulty
  │   ├── tags
  │   ├── imageUrl
  │   ├── completionCount
  │   ├── averageRating
  │   ├── createdAt
  │   ├── updatedAt
  │   └── days/
  │       ├── {dayId}/
  │       │   ├── title
  │       │   ├── description
  │       │   ├── order
  │       │   └── activities/
  │       │       ├── {activityId}/
  │       │       │   ├── title
  │       │       │   ├── description
  │       │       │   ├── type
  │       │       │   ├── duration
  │       │       │   ├── resources
  │       │       │   └── order
  │       │       └── ...
  │       └── ...
  └── ...
```

```
quizzes/
  ├── {quizId}/
  │   ├── title
  │   ├── description
  │   ├── category
  │   ├── duration
  │   ├── difficulty
  │   ├── tags
  │   ├── imageUrl
  │   ├── completionCount
  │   ├── averageScore
  │   ├── createdAt
  │   ├── updatedAt
  │   └── questions/
  │       ├── {questionId}/
  │       │   ├── text
  │       │   ├── order
  │       │   ├── explanation
  │       │   └── options/
  │       │       ├── {optionId}/
  │       │       │   ├── text
  │       │       │   └── score
  │       │       └── ...
  │       └── ...
  └── ...
```

```
prompts/
  ├── {promptId}/
  │   ├── text
  │   ├── category
  │   ├── description
  │   ├── suggestedDuration
  │   ├── difficulty
  │   ├── tags
  │   ├── imageUrl
  │   ├── responseCount
  │   ├── favoriteCount
  │   ├── createdAt
  │   ├── updatedAt
  │   └── responses/
  │       ├── {responseId}/
  │       │   ├── userId
  │       │   ├── text
  │       │   └── createdAt
  │       └── ...
  └── ...
```

## API Endpoints

### Get All Journeys
```http
GET /journeys
```

### Get Specific Journey
```http
GET /journeys/:id
```

### Get Journeys by Category
```http
GET /journeys/category/:category
```

### Get Popular Journeys
```http
GET /journeys/popular
```

### Quizzes

#### Get All Quizzes
```http
GET /quizzes
```

#### Get Specific Quiz
```http
GET /quizzes/:id
```

#### Get Quizzes by Category
```http
GET /quizzes/category/:category
```

#### Get Popular Quizzes
```http
GET /quizzes/popular
```

### Prompts

#### Get All Prompts
```http
GET /prompts
```

#### Get Specific Prompt
```http
GET /prompts/:id
```

#### Get Prompts by Category
```http
GET /prompts/category/:category
```

#### Get Popular Prompts
```http
GET /prompts/popular
```

## Content Management

### Adding New Journeys

1. Create journey document
2. Add days subcollection
3. Add activities for each day
4. Update journey metadata

Example:
```typescript
await db.collection('journeys').add({
  title: 'New Journey',
  description: 'Journey description',
  category: 'relationships',
  duration: 7,
  difficulty: 'beginner',
  tags: ['communication', 'trust'],
  imageUrl: 'url/to/image',
  completionCount: 0,
  averageRating: 0,
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
});
```

### Adding New Quizzes

1. Create quiz document
2. Add questions subcollection
3. Add options for each question
4. Update quiz metadata

Example:
```typescript
await db.collection('quizzes').add({
  title: 'Love Languages Assessment',
  description: 'Discover your primary love language',
  category: 'relationships',
  duration: 10,
  difficulty: 'beginner',
  tags: ['love languages', 'communication'],
  imageUrl: 'url/to/image',
  completionCount: 0,
  averageScore: 0,
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
});
```

### Adding New Prompts

1. Create prompt document
2. Set up responses subcollection
3. Update prompt metadata

Example:
```typescript
await db.collection('prompts').add({
  text: 'Share a recent moment when your partner made you feel valued',
  category: 'appreciation',
  description: 'Express gratitude for meaningful moments',
  suggestedDuration: 10,
  difficulty: 'beginner',
  tags: ['appreciation', 'gratitude'],
  imageUrl: 'url/to/image',
  responseCount: 0,
  favoriteCount: 0,
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
});
```

### Updating Content

1. Use transaction for atomic updates
2. Update timestamp
3. Invalidate cache

Example:
```typescript
await db.runTransaction(async (transaction) => {
  const journeyRef = db.collection('journeys').doc(journeyId);
  transaction.update(journeyRef, {
    description: 'Updated description',
    updatedAt: admin.firestore.Timestamp.now(),
  });
});
```

## Performance Considerations

1. **Caching**
   - 5-minute cache for journey list
   - Individual journey caching
   - Cache invalidation on updates

2. **Query Optimization**
   - Indexed fields
   - Paginated results
   - Efficient subcollection queries

3. **Data Loading**
   - Lazy loading of activities
   - Progressive image loading
   - Optimized batch operations

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journeys/{journeyId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
      
      match /days/{dayId} {
        allow read: if true;
        allow write: if request.auth.token.admin == true;
        
        match /activities/{activityId} {
          allow read: if true;
          allow write: if request.auth.token.admin == true;
        }
      }
    }
  }
}
```

## Best Practices

1. **Content Creation**
   - Use consistent formatting
   - Include clear descriptions
   - Provide relevant resources
   - Test all activities
   - Review content regularly

2. **Maintenance**
   - Regular content audits
   - Update outdated information
   - Monitor user feedback
   - Track completion rates
   - Optimize based on analytics

3. **Quality Control**
   - Content review process
   - User feedback integration
   - Regular updates
   - Performance monitoring
   - Security compliance

## Contributing

When adding new journey content:

1. Follow the data model structure
2. Include all required fields
3. Add appropriate metadata
4. Test the content flow
5. Update documentation

## Future Enhancements

1. Content personalization
2. A/B testing support
3. Multi-language content
4. Interactive elements
5. Dynamic difficulty adjustment 