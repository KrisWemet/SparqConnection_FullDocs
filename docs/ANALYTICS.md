# Analytics Documentation

## Overview
The Sparq Connection analytics system tracks user interactions, feedback, and platform usage to improve user experience and inform product decisions. The system is built with privacy in mind, following GDPR guidelines and best practices for data collection.

## Analytics Events

### Core Events
1. **User Authentication**
   - `user_signup`
   - `user_login`
   - `user_logout`
   - `password_reset_requested`

2. **Journey Interactions**
   - `journey_started`
   - `journey_completed`
   - `reflection_submitted`
   - `activity_completed`

3. **Quiz Events**
   - `quiz_started`
   - `quiz_completed`
   - `quiz_answer_submitted`

4. **Feedback Events**
   - `feedback_submitted`
   - `rating_provided`
   - `feature_requested`

### Event Schema
```typescript
interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  timestamp?: Date;
  properties?: Record<string, unknown>;
  sessionId?: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    screenResolution?: string;
  };
}
```

## API Endpoints

### Track Event
```typescript
POST /api/analytics/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventName": "journey_started",
  "properties": {
    "journeyId": "123",
    "category": "communication"
  }
}
```

### Get Analytics Data (Admin Only)
```typescript
GET /api/analytics/data
Authorization: Bearer <token>
Query Parameters:
- startDate: ISO date string
- endDate: ISO date string
- eventName: string
```

### Get User Analytics
```typescript
GET /api/analytics/user/:userId
Authorization: Bearer <token>
```

### Get Aggregated Metrics (Admin Only)
```typescript
GET /api/analytics/metrics
Authorization: Bearer <token>
Query Parameters:
- timeframe: '24h' | '7d' | '30d'
```

## Implementation

### Frontend Integration
1. **Analytics Utility**
```typescript
// utils/analytics.ts
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  await fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ eventName, properties }),
  });
};
```

2. **Component Usage**
```typescript
import { trackEvent } from '../utils/analytics';

// Track user interaction
await trackEvent('feature_used', {
  featureId: 'feedback_form',
  action: 'submitted',
});
```

### Rate Limiting
- 100 requests per IP per 15 minutes
- Configurable through environment variables

### Data Retention
- Event data: 90 days
- Aggregated metrics: Indefinite
- User-specific data: Until account deletion

## Security & Privacy

### Data Protection
1. **User Privacy**
   - Personal data is minimized
   - Data is encrypted at rest
   - Optional user identification

2. **Access Control**
   - Admin-only access to aggregated data
   - Users can only access their own data
   - JWT authentication required

3. **GDPR Compliance**
   - Right to be forgotten supported
   - Data export functionality
   - Clear data usage documentation

### Best Practices
1. **Data Collection**
   - Collect only necessary data
   - Clear user consent required
   - Transparent data usage

2. **Data Storage**
   - Firestore security rules
   - Regular security audits
   - Automated data cleanup

## Monitoring & Maintenance

### Performance Monitoring
1. **Metrics**
   - Request latency
   - Error rates
   - Event volume

2. **Alerts**
   - High error rates
   - Unusual event patterns
   - Rate limit breaches

### Maintenance Tasks
1. **Regular**
   - Data cleanup
   - Performance optimization
   - Security updates

2. **Monthly**
   - Usage reports
   - Trend analysis
   - System health check

## Testing

### Unit Tests
```typescript
describe('Analytics Events', () => {
  it('should track event successfully', async () => {
    const response = await trackEvent('test_event', {
      testProperty: 'value',
    });
    expect(response.success).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('Analytics API', () => {
  it('should enforce rate limiting', async () => {
    // Make 101 requests
    const responses = await Promise.all(
      Array(101).fill(null).map(() =>
        trackEvent('test_event')
      )
    );
    
    const lastResponse = responses[100];
    expect(lastResponse.status).toBe(429);
  });
});
```

## Future Enhancements

### Planned Features
1. **Real-time Analytics**
   - Live dashboard
   - WebSocket integration
   - Instant alerts

2. **Advanced Analytics**
   - Machine learning insights
   - Predictive analytics
   - Custom report builder

3. **Integration Options**
   - Google Analytics
   - Mixpanel
   - Custom analytics providers

### Technical Debt
1. **Performance**
   - Query optimization
   - Caching improvements
   - Batch processing

2. **Scalability**
   - Sharding strategy
   - Load balancing
   - Data archival 