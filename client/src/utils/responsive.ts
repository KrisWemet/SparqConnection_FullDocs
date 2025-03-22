// Breakpoint sizes (in pixels)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

// Media query functions for styled-components
export const media = {
  up: (breakpoint: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof breakpoints) => `@media (max-width: ${breakpoints[breakpoint] - 0.05}px)`,
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.05}px)`,
  only: (breakpoint: keyof typeof breakpoints) => {
    const keys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
    const idx = keys.indexOf(breakpoint);
    
    if (idx === keys.length - 1) {
      return media.up(breakpoint);
    }
    
    const nextBreakpoint = keys[idx + 1];
    return media.between(breakpoint, nextBreakpoint);
  }
};

// Helper function to check current viewport size
export const isViewport = {
  xs: () => window.innerWidth < breakpoints.sm,
  sm: () => window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.md,
  md: () => window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg,
  lg: () => window.innerWidth >= breakpoints.lg && window.innerWidth < breakpoints.xl,
  xl: () => window.innerWidth >= breakpoints.xl
};

// Hook for window resize event
export const useWindowResize = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }
  return undefined;
};

// Helper for calculating rem values
export const rem = (pixels: number) => `${pixels / 16}rem`;

// Helper for calculating em values
export const em = (pixels: number, context = 16) => `${pixels / context}em`;

// Common device sizes for testing
export const devices = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 }
}; 