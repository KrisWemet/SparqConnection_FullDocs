/**
 * Service for handling push notifications
 */

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Create and show a notification
export const showNotification = (title: string, options: NotificationOptions = {}): Notification | null => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  
  try {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      ...options
    });
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  swRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });
    
    // Send subscription to backend
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

// Add an export statement to make this a module
export {}; 