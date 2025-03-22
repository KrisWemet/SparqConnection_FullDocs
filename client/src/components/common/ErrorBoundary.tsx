import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Here you could send error reports to your error tracking service
    // Example: Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ErrorMessage>
          <RetryButton
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </RetryButton>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <ErrorStack>
              {this.state.errorInfo.componentStack}
            </ErrorStack>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
`;

const RetryButton = styled(motion.button)`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--primary-dark);
  }
`;

const ErrorStack = styled.pre`
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-width: 100%;
`;

export default ErrorBoundary; 