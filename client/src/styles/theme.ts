import { DefaultTheme } from 'styled-components';

export interface Theme {
  colors: {
    primary: string;
    'primary-light': string;
    'primary-dark': string;
    secondary: string;
    'secondary-dark': string;
    background: string;
    text: {
      primary: string;
      secondary: string;
    };
    border: string;
    disabled: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}

export const theme: Theme = {
  colors: {
    primary: '#6366F1',
    'primary-light': '#818CF8',
    'primary-dark': '#4F46E5',
    secondary: '#10B981',
    'secondary-dark': '#059669',
    background: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
    border: '#E5E7EB',
    disabled: '#D1D5DB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

export type AppTheme = typeof theme;
declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

export default theme; 