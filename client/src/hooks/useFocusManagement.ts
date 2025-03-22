import { useRef, useEffect } from 'react';

interface FocusManagementOptions {
  shouldFocus?: boolean;
  focusOnMount?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const useFocusManagement = (options: FocusManagementOptions = {}) => {
  const {
    shouldFocus = true,
    focusOnMount = false,
    onFocus,
    onBlur
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (focusOnMount && shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [focusOnMount, shouldFocus]);

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return {
    elementRef,
    handleFocus,
    handleBlur,
    focus: () => elementRef.current?.focus(),
    blur: () => elementRef.current?.blur()
  };
}; 