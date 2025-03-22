# Sparq Connection Components Documentation

## Journey Components

The Journey feature is split into several components to manage different stages of the user's journey progress, with built-in partner synchronization.

### Main Components

#### `Journey`
The main orchestrator component that manages the journey flow and partner synchronization.

- **Props**:
  - `journeyId: string` - Unique identifier for the journey

- **Features**:
  - Partner progress tracking
  - Push notifications for partner updates
  - Encrypted data handling
  - Step management

#### `BeginStep`
The initial step that shows journey progress and partner status.

- **Props**:
  - `journey: Journey` - Journey data
  - `onStart: () => void` - Start handler
  - `partnerProgress?: { currentDay: number; lastActivity: Date }` - Partner's progress

- **Features**:
  - Partner sync status display
  - Progress visualization
  - Conditional progression based on partner status

#### `ShareStep`
Displays daily activities and content.

- **Props**:
  - `journey: Journey` - Journey data
  - `onContinue: () => void` - Continue handler

- **Features**:
  - Animated activity display
  - Day-specific content
  - Progress tracking

#### `ReflectStep`
Handles user reflections with encryption.

- **Props**:
  - `journey: Journey` - Journey data
  - `user: User` - User data for encryption
  - `onSubmit: (data: { reflection: string; iv: string }) => Promise<void>` - Submit handler

- **Features**:
  - Client-side encryption
  - Real-time validation
  - Progress persistence

#### `AlignStep`
Manages partner synchronization for shared activities.

- **Props**:
  - `journey: Journey` - Journey data
  - `onStartFocus: () => void` - Focus activity handler

- **Features**:
  - Partner status display
  - Sync state management
  - Push notification triggers

### Supporting Components

#### `PartnerStatus`
Displays partner's progress and activity status.

- **Props**:
  - `currentDay: number` - User's current day
  - `partnerDay: number` - Partner's current day
  - `lastActivity: Date` - Partner's last activity timestamp

### Hooks

#### `useJourney`
Manages journey data and progress updates.

```typescript
const { journey, loading, error, updateProgress } = useJourney(journeyId);
```

#### `useFCM`
Handles Firebase Cloud Messaging for partner notifications.

```typescript
const { sendNotification } = useFCM();
```

### Partner Synchronization

The journey components implement a synchronized progression system:

1. **Progress Tracking**:
   - Both partners' progress is tracked in real-time
   - Partner status is displayed throughout the journey
   - Push notifications are sent when partners fall behind

2. **Sync States**:
   - `pending`: Initial state
   - `waiting`: Waiting for partner to complete current step
   - `synced`: Both partners are on the same step

3. **Notifications**:
   - Automatic notifications when partner falls behind
   - Custom encouragement messages
   - Deep links to current journey step

### Data Security

1. **Encryption**:
   - All reflections are encrypted client-side
   - Each user has their own encryption keys
   - IVs are generated per reflection

2. **Storage**:
   - Encrypted data is stored in Firestore
   - Keys are never transmitted to the server
   - Partner access is managed through key exchange

### Testing

Components are tested using React Testing Library:

```typescript
describe('Journey Component', () => {
  it('handles partner sync states correctly', () => {
    // Test implementation
  });

  it('encrypts reflections before submission', () => {
    // Test implementation
  });
});
```

### Usage Example

```typescript
// In a route component
<Journey journeyId="journey-123" />

// Partner sync will be handled automatically
// Notifications will be sent when needed
// Data will be encrypted by default
```

### Best Practices

1. **Component Organization**:
   - Keep components focused and small
   - Use TypeScript for type safety
   - Implement proper error boundaries

2. **State Management**:
   - Use hooks for complex state
   - Keep partner sync logic centralized
   - Handle edge cases gracefully

3. **Security**:
   - Always encrypt sensitive data
   - Validate data client-side
   - Handle errors securely

4. **Performance**:
   - Implement proper loading states
   - Use React.memo where beneficial
   - Optimize re-renders

### Future Improvements

1. **Offline Support**:
   - Implement service worker caching
   - Queue updates when offline
   - Sync when connection restored

2. **Enhanced Security**:
   - Add key rotation
   - Implement backup key system
   - Add integrity checks

3. **Partner Features**:
   - Add real-time chat
   - Implement video sessions
   - Add shared goals

## Dashboard Components

The Dashboard is the main landing page of the application, providing quick access to all major features and tracking progress.

### `Dashboard`
The main dashboard component that displays feature cards and premium content teasers.

- **Location**: `client/src/components/Dashboard.tsx`

- **Features**:
  - Responsive grid layout
  - Progress tracking visualization
  - Premium feature indicators
  - Animated card interactions
  - Premium subscription teaser

### `DashboardCard`
A reusable card component for dashboard features.

- **Props**:
  ```typescript
  interface DashboardCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
    isPremium?: boolean;
    completed?: number;
    total?: number;
  }
  ```

- **Features**:
  - Progress bar visualization
  - Premium badge display
  - Hover and tap animations
  - React Router integration

### Card Types

1. **Daily Prompt**
   - Progress tracking
   - Daily reflection prompts
   - Completion statistics

2. **Relationship Quiz**
   - Progress tracking
   - Knowledge assessment
   - Score visualization

3. **Love Journeys**
   - Progress tracking
   - Partner synchronization
   - Journey milestones

4. **Activities**
   - Premium feature
   - Categories: fun, intimate, date night
   - 90+ curated activities

5. **Expert Advice**
   - Premium feature
   - Professional guidance
   - Relationship tips

### Premium Integration

The dashboard implements a premium feature system:

1. **Premium Indicators**:
   - Premium badges on restricted features
   - Visual distinction for premium content
   - Clear upgrade prompts

2. **Premium Teaser**:
   - Dedicated card for premium features
   - Compelling value proposition
   - Direct link to upgrade flow

### Testing

The dashboard components are tested using React Testing Library:

```typescript
describe('Dashboard Component', () => {
  it('renders all feature cards', () => {
    // Test implementation
  });

  it('displays premium badges correctly', () => {
    // Test implementation
  });
});
```

### Usage Example

```typescript
// In App.tsx or a route component
<Dashboard />
```

### Best Practices

1. **Performance**:
   - Lazy loading for card content
   - Optimized animations
   - Responsive image loading

2. **Accessibility**:
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - Color contrast compliance

3. **Responsive Design**:
   - Mobile-first approach
   - Grid layout adaptation
   - Touch-friendly interactions

### Future Improvements

1. **Personalization**:
   - Custom card ordering
   - Favorite features
   - Progress goals

2. **Engagement**:
   - Activity streaks
   - Achievement badges
   - Partner challenges

3. **Analytics**:
   - Usage tracking
   - Feature popularity
   - Conversion metrics 