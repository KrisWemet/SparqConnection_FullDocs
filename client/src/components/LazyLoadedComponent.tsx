import React, { Suspense, ComponentType } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  component: ComponentType;
}

const LazyLoadedComponent: React.FC<Props> = ({ component: Component }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoadedComponent;

// Example usage:
// const LazyComponent = React.lazy(() => import('./HeavyComponent'));
// <LazyLoadedComponent component={LazyComponent} props={{ someProps: value }} /> 