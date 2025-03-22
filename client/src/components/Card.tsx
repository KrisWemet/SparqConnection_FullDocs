import React from 'react';
import styled, { css } from 'styled-components';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

const getPadding = (padding: CardProps['padding']) => {
  switch (padding) {
    case 'small':
      return '0.75rem';
    case 'medium':
      return '1.5rem';
    case 'large':
      return '2rem';
    case 'none':
    default:
      return '0';
  }
};

const getRadius = (radius: CardProps['radius']) => {
  switch (radius) {
    case 'small':
      return '0.25rem';
    case 'medium':
      return '0.5rem';
    case 'large':
      return '1rem';
    case 'none':
    default:
      return '0';
  }
};

const StyledCard = styled.div<CardProps>`
  background: ${({ theme }) => theme.colors.background};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  padding: ${({ padding = 'medium' }) => getPadding(padding)};
  border-radius: ${({ radius = 'medium' }) => getRadius(radius)};
  transition: all 0.2s ease-in-out;

  ${({ variant = 'default' }) =>
    variant === 'outlined' &&
    css`
      border: 1px solid ${({ theme }) => theme.colors.border};
    `}

  ${({ variant = 'default' }) =>
    variant === 'elevated' &&
    css`
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `}

  ${({ hoverable }) =>
    hoverable &&
    css`
      cursor: pointer;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    `}
`;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCard ref={ref} {...props}>
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card'; 