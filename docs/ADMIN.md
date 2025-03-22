# Sparq Connection Admin Documentation

## Overview

The Sparq Connection admin dashboard provides real-time monitoring of Firestore usage metrics, with features for tracking operations, setting alerts, and managing quotas.

## Features

- Real-time Firestore usage monitoring
- Operation type breakdown (reads, writes, deletes)
- Quota usage visualization with gauge charts
- Automated email alerts for high usage
- Historical usage data tracking
- Metric reset functionality

## Components

### AdminDashboard

The main dashboard component (`client/src/components/AdminDashboard.tsx`) provides a visual interface for monitoring Firestore usage.

#### Features:
- Gauge chart showing total operations vs quota
- Doughnut chart for operation type breakdown
- Real-time metrics updates (5-minute intervals)
- Warning banner for high usage
- Responsive design for all screen sizes

#### Usage:
```typescript
import AdminDashboard from '../components/AdminDashboard';

function AdminPage() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <AdminDashboard />
    </div>
  );
}
```

## API Endpoints

### Base URL: `/admin/metrics`

All endpoints require admin authentication via JWT.

#### 1. Get Current Metrics
```http
GET /admin/metrics
```

Returns current Firestore usage metrics.

Response:
```json
{
  "success": true,
  "data": {
    "readCount": 1000,
    "writeCount": 500,
    "deleteCount": 100,
    "totalOperations": 1600,
    "quotaLimit": 50000,
    "lastUpdated": "2024-01-01T12:00:00Z"
  }
}
```

#### 2. Reset Metrics
```http
POST /admin/metrics/reset
```

Resets all usage metrics to zero. Typically used at the start of a billing cycle.

#### 3. Get Historical Data
```http
GET /admin/metrics/history
```

Returns the last 30 days of usage data.

## Firestore Metrics Collection

The metrics are stored in Firestore under the `_metrics` collection:

```
_metrics/
  ├── usage/
  │   └── current usage document
  └── history/
      └── daily/
          ├── 2024-01-01
          ├── 2024-01-02
          └── ...
```

### Metrics Document Structure
```typescript
interface MetricsDocument {
  readCount: number;
  writeCount: number;
  deleteCount: number;
  totalOperations: number;
  lastUpdated: string;
}
```

## Email Alerts

The system sends email alerts via SendGrid when usage exceeds 40% of the quota.

### Configuration

Required environment variables:
```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@sparqconnection.com
ADMIN_EMAIL=admin@example.com
```

### Alert Email Template
The email includes:
- Current usage percentage
- Breakdown of operations
- Quota limit information
- Recommendations for action

## Caching

Metrics are cached for 5 minutes to reduce Firestore reads:

- Cache key: `firestore_metrics`
- TTL: 5 minutes
- Auto-invalidation on metric reset

## Security

### Authentication
- All admin routes are protected by JWT authentication
- Token verification via Firebase Admin SDK
- Role-based access control (admin only)

### Best Practices
1. Use environment variables for sensitive data
2. Implement rate limiting for API endpoints
3. Regular security audits
4. Monitoring of failed authentication attempts

## Monitoring and Maintenance

### Daily Tasks
1. Check usage metrics
2. Review any alert emails
3. Monitor failed requests
4. Verify data consistency

### Monthly Tasks
1. Reset metrics at billing cycle
2. Review historical data
3. Adjust quotas if needed
4. Backup metrics data

## Troubleshooting

### Common Issues

1. **Metrics Not Updating**
   - Check Firestore permissions
   - Verify cache invalidation
   - Check for API errors in console

2. **Email Alerts Not Sending**
   - Verify SendGrid API key
   - Check email configuration
   - Review error logs

3. **Dashboard Not Loading**
   - Verify JWT token
   - Check API endpoint status
   - Review browser console errors

## Development

### Adding New Metrics

1. Update the `FirestoreMetrics` interface
2. Modify the metrics collection logic
3. Update the dashboard visualization
4. Update documentation

### Testing

Run tests with:
```bash
npm test -- --grep "Admin Dashboard"
```

Key test files:
- `__tests__/components/AdminDashboard.test.tsx`
- `__tests__/routes/admin.test.ts`

## Future Enhancements

Planned features:
1. Real-time WebSocket updates
2. Custom alert thresholds
3. Export metrics to CSV/PDF
4. Advanced analytics dashboard
5. Integration with monitoring services

## Contributing

When contributing to the admin dashboard:

1. Follow TypeScript best practices
2. Add appropriate tests
3. Update documentation
4. Consider performance implications
5. Maintain security standards 