import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling at regular intervals
 * @param callback Function to execute on each poll
 * @param interval Polling interval in milliseconds
 * @param immediate Whether to call the callback immediately when the hook mounts
 */
export const usePolling = (
  callback: () => void,
  interval: number = 30000,
  immediate: boolean = false
) => {
  const savedCallback = useRef<() => void>();
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval
  useEffect(() => {
    // Call immediately if requested
    if (immediate && savedCallback.current) {
      savedCallback.current();
    }
    
    // Set up polling interval
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };
    
    const id = setInterval(tick, interval);
    
    // Cleanup function
    return () => clearInterval(id);
  }, [interval, immediate]);
};

export default usePolling; 