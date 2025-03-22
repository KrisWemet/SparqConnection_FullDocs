import { getToken } from './auth';

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

/**
 * Track an analytics event
 * @param eventName Name of the event to track
 * @param properties Event properties to track
 */
export const trackEvent = async (eventName: string, properties: Record<string, any> = {}): Promise<void> => {
  try {
    const token = await getToken();
    
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now()
    };
    
    // Log events to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('ANALYTICS EVENT:', event);
    }
    
    // In production, this would call your analytics API
    if (process.env.NODE_ENV === 'production') {
      // Send event to analytics API
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(token ? { Authorization: `Bearer ${token}` } : {})
      //   },
      //   body: JSON.stringify(event)
      // });
    }
  } catch (error) {
    // Don't crash the app if analytics fails
    console.error('Failed to track analytics event:', error);
  }
};

/**
 * Identify the current user for analytics
 * @param userId User ID to identify
 * @param traits User traits to record
 */
export const identifyUser = async (userId: string, traits: Record<string, any> = {}): Promise<void> => {
  try {
    // In production, this would call your analytics identify method
    if (process.env.NODE_ENV === 'production') {
      // Identify user in analytics platform
      // await fetch('/api/analytics/identify', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ userId, traits })
      // });
    }
    
    // Log identify call to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('ANALYTICS IDENTIFY:', { userId, traits });
    }
  } catch (error) {
    console.error('Failed to identify user for analytics:', error);
  }
};

// Initialize session ID
if (!window.sessionStorage.getItem('sessionId')) {
  window.sessionStorage.setItem('sessionId', crypto.randomUUID());
} 