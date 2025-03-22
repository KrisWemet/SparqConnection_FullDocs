import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'var(--primary)' 
}) => {
  return (
    <SpinnerWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Spinner
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        size={size}
        color={color}
      />
    </SpinnerWrapper>
  );
};

const SpinnerWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
`;

const Spinner = styled(motion.div)<{ size: string; color: string }>`
  width: ${({ size }) => ({
    small: '24px',
    medium: '40px',
    large: '56px'
  }[size])};
  height: ${({ size }) => ({
    small: '24px',
    medium: '40px',
    large: '56px'
  }[size])};
  border: 3px solid ${({ color }) => color};
  border-top: 3px solid transparent;
  border-radius: 50%;
`;

export default LoadingSpinner; 