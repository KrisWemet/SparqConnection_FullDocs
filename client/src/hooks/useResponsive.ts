import { useState, useEffect } from 'react';
import { breakpoints } from '../utils/responsive';

type BreakpointKey = keyof typeof breakpoints;

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: BreakpointKey;
  width: number;
  height: number;
}

/**
 * Hook for responsive design that tracks viewport size and current breakpoint
 */
const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'md',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    // Skip if we're not in a browser
    if (typeof window === 'undefined') return;
    
    // Initial check
    handleResize();
    
    // Add event listener for resize
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Determine current breakpoint
    let breakpoint: BreakpointKey = 'xs';
    if (width >= breakpoints.xl) breakpoint = 'xl';
    else if (width >= breakpoints.lg) breakpoint = 'lg';
    else if (width >= breakpoints.md) breakpoint = 'md';
    else if (width >= breakpoints.sm) breakpoint = 'sm';
    
    setState({
      isMobile: width < breakpoints.sm,
      isTablet: width >= breakpoints.sm && width < breakpoints.md,
      isDesktop: width >= breakpoints.md,
      breakpoint,
      width,
      height
    });
  };

  return state;
};

export default useResponsive; 