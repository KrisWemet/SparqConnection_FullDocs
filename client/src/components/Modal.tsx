import React, { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiX } from 'react-icons/fi';
import { Card } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-in-out;
  ${({ isOpen }) =>
    !isOpen &&
    css`
      display: none;
    `}
`;

const ModalContainer = styled(Card)<{ size: ModalProps['size'] }>`
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-in-out;
  
  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          width: 90%;
          max-width: 400px;
        `;
      case 'large':
        return css`
          width: 90%;
          max-width: 800px;
        `;
      default:
        return css`
          width: 90%;
          max-width: 600px;
        `;
    }
  }}
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    opacity: 1;
  }
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer
        variant="elevated"
        size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle id="modal-title">{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton
                onClick={onClose}
                aria-label="Close modal"
              >
                <FiX size={24} />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        {children}
      </ModalContainer>
    </Overlay>
  );
}; 