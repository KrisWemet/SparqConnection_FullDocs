import { HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

export interface BaseButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  padding?: string | number;
  elevation?: 0 | 1 | 2 | 3;
}

export interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
}

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string | number;
}

export interface BadgeProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
} 