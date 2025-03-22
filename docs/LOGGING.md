# Sparq Connection Logging Documentation

## Analytics Logging

The Sparq Connection application uses Winston for structured logging of journey and activity analytics. This document outlines the logging system's implementation, configuration, and usage.

## Setup

### Dependencies

```json
{
  "dependencies": {
    "winston": "^3.8.0"
  }
}
```

### Directory Structure

```
├── logs/
│   └── analytics/
│       ├── analytics.log    # Main analytics log file
│       └── error.log        # Error-level events
└── server/
    └── utils/
        └── analyticsLogger.ts
```

## Log Events

### Event Types

```typescript
enum AnalyticsEventType {
  JOURNEY_START = 'JOURNEY_START',
  DAY_COMPLETE = 'DAY_COMPLETE',
  ACTIVITY_COMPLETE = 'ACTIVITY_COMPLETE',
  SKIPPED_ACTIVITY = 'SKIPPED_ACTIVITY',
}
```

### Event Interfaces

#### Base Event
```typescript
interface BaseAnalyticsEvent {
  eventType: AnalyticsEventType;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

#### Journey Event
```typescript
interface JourneyEvent extends BaseAnalyticsEvent {
  journeyId: string;
  journeyTitle: string;
  dayNumber?: number;
}
```

#### Activity Event
```typescript
interface ActivityEvent extends BaseAnalyticsEvent {
  journeyId: string;
  activityId: string;
  activityTitle: string;
  dayNumber: number;
  duration?: number;
  completionStatus?: 'success' | 'partial' | 'failed';
}
```

## Usage

### Importing the Logger

```typescript
import {
  logJourneyStart,
  logDayComplete,
  logActivityComplete,
  logSkippedActivity,
  logAnalyticsError,
} from '../utils/analyticsLogger';
```

### Logging Events

#### Journey Start
```typescript
logJourneyStart(
  userId,
  journeyId,
  journeyTitle,
  {
    startedAt: new Date(),
    partnerPresent: true,
  }
);
```

#### Day Complete
```typescript
logDayComplete(
  userId,
  journeyId,
  journeyTitle,
  dayNumber,
  {
    completionTime: 3600, // seconds
    reflectionLength: 500, // characters
  }
);
```

#### Activity Complete
```typescript
logActivityComplete(
  userId,
  journeyId,
  activityId,
  activityTitle,
  dayNumber,
  duration,
  'success',
  {
    partnerParticipated: true,
    difficulty: 'medium',
  }
);
```

#### Skipped Activity
```typescript
logSkippedActivity(
  userId,
  journeyId,
  activityId,
  activityTitle,
  dayNumber,
  {
    reason: 'partner_unavailable',
    willRetry: true,
  }
);
```

### Error Logging
```typescript
try {
  // Some operation
} catch (error) {
  logAnalyticsError(error, {
    userId,
    journeyId,
    operation: 'activity_completion',
  });
}
```

## Log Format

### Example Log Entry
```json
{
  "level": "info",
  "message": "Activity completed",
  "timestamp": "2024-02-20T15:30:00.000Z",
  "metadata": {
    "service": "sparq-analytics",
    "eventType": "ACTIVITY_COMPLETE",
    "userId": "user123",
    "journeyId": "journey456",
    "activityId": "act789",
    "activityTitle": "Mindful Communication",
    "dayNumber": 3,
    "duration": 1800,
    "completionStatus": "success",
    "metadata": {
      "partnerParticipated": true,
      "difficulty": "medium"
    }
  }
}
```

## Configuration

### Log Rotation

- Maximum file size: 5MB
- Maximum files: 5
- Files are tailable for real-time monitoring

### Environment-Specific Settings

```typescript
// Development: Console + File logging
NODE_ENV=development

// Production: File logging only
NODE_ENV=production
```

## Best Practices

1. **Consistent Event Structure**
   - Always include required fields
   - Use appropriate event type
   - Add relevant metadata

2. **Error Handling**
   - Log errors with context
   - Include stack traces
   - Add operation-specific details

3. **Performance**
   - Use async logging when possible
   - Keep metadata size reasonable
   - Rotate logs regularly

4. **Security**
   - Never log sensitive data
   - Sanitize user input
   - Follow data retention policies

## Monitoring and Analysis

### Log Analysis Tools

1. **Real-time Monitoring**
   ```bash
   tail -f logs/analytics/analytics.log | jq
   ```

2. **Common Queries**
   ```bash
   # Find all events for a specific user
   grep "userId\":\"user123" analytics.log

   # Count events by type
   grep -c "ACTIVITY_COMPLETE" analytics.log
   ```

### Metrics Collection

Key metrics to monitor:

1. **Journey Engagement**
   - Start rate
   - Completion rate
   - Average duration

2. **Activity Performance**
   - Completion rate
   - Skip rate
   - Average duration

3. **Partner Sync**
   - Sync success rate
   - Partner participation rate
   - Average sync delay

## Maintenance

### Log Rotation

Logs are automatically rotated:
- When file reaches 5MB
- Maximum of 5 files kept
- Oldest files are automatically deleted

### Cleanup

```bash
# Manual cleanup of old logs
find logs/analytics -name "*.log" -mtime +30 -delete
```

### Backup

```bash
# Daily log backup
0 0 * * * tar -czf /backup/analytics-$(date +%Y%m%d).tar.gz /logs/analytics/
```

## Troubleshooting

### Common Issues

1. **Missing Logs**
   - Check file permissions
   - Verify log directory exists
   - Check disk space

2. **Performance Issues**
   - Monitor log file size
   - Check log rotation
   - Optimize metadata size

3. **Data Quality**
   - Validate event structure
   - Check required fields
   - Verify timestamps

### Debug Mode

```typescript
// Enable debug logging
analyticsLogger.level = 'debug';
```

## Contributing

When adding new log events:

1. Update `AnalyticsEventType` enum
2. Add appropriate interfaces
3. Create helper functions
4. Update documentation
5. Add example usage 