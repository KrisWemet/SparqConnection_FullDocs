import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const getButtonStyles = (variant: ButtonVariant = 'primary') => {
  switch (variant) {
    case 'primary':
      return css<{ theme: Theme }>`
        background-color: ${({ theme }) => theme.colors.primary};
        color: white;
        border: none;
        &:hover {
          background-color: ${({ theme }) => theme.colors['primary-dark']};
        }
      `;
    case 'secondary':
      return css<{ theme: Theme }>`
        background-color: ${({ theme }) => theme.colors.secondary};
        color: white;
        border: none;
        &:hover {
          background-color: ${({ theme }) => theme.colors['secondary-dark']};
        }
      `;
    case 'outline':
      return css<{ theme: Theme }>`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 2px solid ${({ theme }) => theme.colors.primary};
        &:hover {
          background-color: ${({ theme }) => theme.colors.primary};
          color: white;
        }
      `;
    case 'text':
      return css<{ theme: Theme }>`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: none;
        padding: 0;
        &:hover {
          text-decoration: underline;
        }
      `;
    default:
      return '';
  }
};

const getButtonSize = (size: ButtonSize = 'medium') => {
  switch (size) {
    case 'small':
      return css`
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      `;
    case 'medium':
      return css`
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
      `;
    case 'large':
      return css`
        padding: 1rem 2rem;
        font-size: 1.125rem;
      `;
    default:
      return '';
  }
};

const StyledButton = styled.button<ButtonProps & { theme: Theme }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  ${props => getButtonStyles(props.variant)}
  ${props => getButtonSize(props.size)}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, startIcon, endIcon, ...props }, ref) => {
    return (
      <StyledButton ref={ref} {...props}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {startIcon}
            {children}
            {endIcon}
          </>
        )}
      </StyledButton>
    );
  }
); 