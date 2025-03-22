import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
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
} 