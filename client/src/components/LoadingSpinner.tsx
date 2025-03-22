import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
  size?: string;
  color?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const SpinnerElement = styled.div<SpinnerProps>`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${props => props.color || '#3498db'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, color }) => {
  return (
    <SpinnerContainer>
      <SpinnerElement size={size} color={color} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 