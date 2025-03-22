/**
 * Debug utilities for error monitoring and troubleshooting
 */

// Configure logging based on environment
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isVerboseLogging = process.env.REACT_APP_VERBOSE_LOGGING === 'true';

// Enhanced console logging - only logs in development/when verbose logging is enabled
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev || isVerboseLogging) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev || isVerboseLogging) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDev || isVerboseLogging || !isTest) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    
    // Here you could integrate with an error reporting service like Sentry or Zipy
    if (window.errorReporter && !isDev && !isTest) {
      try {
        window.errorReporter.captureException(error || new Error(message));
      } catch (e) {
        // Don't let the error reporter itself cause problems
        console.error('Error reporting failed:', e);
      }
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isDev || isVerboseLogging) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  trace: (message: string, ...args: any[]) => {
    if (isDev && isVerboseLogging) {
      console.trace(`[TRACE] ${message}`, ...args);
    }
  }
};

// Performance monitoring utility
export const perfMonitor = {
  start: (id: string) => {
    if (isDev || isVerboseLogging) {
      console.time(`⏱️ ${id}`);
    }
  },
  end: (id: string) => {
    if (isDev || isVerboseLogging) {
      console.timeEnd(`⏱️ ${id}`);
    }
  }
};

// State change tracker for debugging Redux and Context state changes
export class StateChangeTracker {
  private name: string;
  private previousState: any;

  constructor(name: string, initialState: any = {}) {
    this.name = name;
    this.previousState = JSON.parse(JSON.stringify(initialState));
    logger.debug(`StateChangeTracker initialized for "${name}"`);
  }

  track(newState: any): void {
    if (!isDev && !isVerboseLogging) return;

    try {
      const changes: Record<string, { from: any; to: any }> = {};
      let hasChanges = false;

      // Find all changes
      Object.keys(newState).forEach((key) => {
        const oldValue = this.previousState[key];
        const newValue = newState[key];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: oldValue, to: newValue };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        console.group(`🔄 State changes in "${this.name}"`);
        Object.keys(changes).forEach((key) => {
          console.log(
            `${key}: `,
            changes[key].from,
            ' → ',
            changes[key].to
          );
        });
        console.groupEnd();
      }

      // Update previous state
      this.previousState = JSON.parse(JSON.stringify(newState));
    } catch (error) {
      logger.error('Error tracking state changes', error);
    }
  }
}

// React DevTools helper
export const setupDevTools = () => {
  if (isDev) {
    // Check if React DevTools is installed
    setTimeout(() => {
      if (
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled
      ) {
        logger.warn(
          'React DevTools is not installed. Install it for better debugging: https://reactjs.org/link/react-devtools'
        );
      } else {
        logger.info('React DevTools detected');
      }
      
      // Check if Redux DevTools is available
      if (!(window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        logger.warn(
          'Redux DevTools is not installed. Install it for better Redux debugging: https://github.com/reduxjs/redux-devtools'
        );
      } else {
        logger.info('Redux DevTools detected');
      }
    }, 3000);
  }
};

// Type definition for window with error reporter
declare global {
  interface Window {
    errorReporter?: {
      captureException: (error: Error) => void;
    };
  }
}

// Initialize dev tools on import
setupDevTools();

export default {
  logger,
  perfMonitor,
  StateChangeTracker
}; 