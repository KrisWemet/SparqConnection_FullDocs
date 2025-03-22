import React, { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const getVariantStyles = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return css`
        background-color: ${({ theme }) => theme.colors.success};
        color: white;
      `;
    case 'error':
      return css`
        background-color: ${({ theme }) => theme.colors.error};
        color: white;
      `;
    case 'warning':
      return css`
        background-color: ${({ theme }) => theme.colors.warning};
        color: white;
      `;
    case 'info':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.info};
        color: white;
      `;
  }
};

const ToastContainer = styled.div<{ variant: ToastVariant; isVisible: boolean }>`
  position: fixed;
  top: 1rem;
  right: 1rem;
  min-width: 300px;
  max-width: 400px;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  animation: ${({ isVisible }) => (isVisible ? slideIn : slideOut)} 0.3s ease-in-out;
  ${({ variant }) => getVariantStyles(variant)}
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Message = styled.p`
  margin: 0;
  flex-grow: 1;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    opacity: 1;
  }
`;

const getIcon = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return <FiCheck size={20} />;
    case 'error':
      return <FiAlertCircle size={20} />;
    case 'warning':
      return <FiAlertCircle size={20} />;
    case 'info':
    default:
      return <FiInfo size={20} />;
  }
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  isVisible,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, duration, onClose]);

  return (
    <ToastContainer
      variant={variant}
      isVisible={isVisible}
      role="alert"
      aria-live="polite"
    >
      <IconContainer>{getIcon(variant)}</IconContainer>
      <Message>{message}</Message>
      <CloseButton onClick={onClose} aria-label="Close notification">
        <FiX size={20} />
      </CloseButton>
    </ToastContainer>
  );
}; 