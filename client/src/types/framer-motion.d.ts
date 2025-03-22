import { ReactElement } from 'react';
import { AnimatePresence as _AnimatePresence } from 'framer-motion';

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    custom?: any;
  }

  export const AnimatePresence: React.FC<AnimatePresenceProps>;
} 