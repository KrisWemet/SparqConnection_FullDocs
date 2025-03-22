export const ariaLabels = {
  // Navigation
  mainNav: 'Main navigation',
  skipToContent: 'Skip to main content',
  
  // Authentication
  loginForm: 'Login form',
  signupForm: 'Sign up form',
  
  // Journey
  journeyProgress: 'Journey progress',
  dayCompletion: 'Day completion status',
  reflectionForm: 'Daily reflection form',
  
  // Common actions
  submit: 'Submit form',
  cancel: 'Cancel action',
  close: 'Close dialog',
  menu: 'Open menu',
  
  // Status
  loading: 'Loading content',
  error: 'Error message',
  success: 'Success message'
};

export const ariaDescriptions = {
  required: 'This field is required',
  optional: 'This field is optional',
  passwordRequirements: 'Password must be at least 8 characters long and contain at least one number and one special character',
  reflectionGuidelines: 'Share your thoughts about today\'s journey experience'
};

export const keyboardNavigation = {
  focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  trapFocus: (event: KeyboardEvent, container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(keyboardNavigation.focusableElements);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          event.preventDefault();
        }
      }
    }
  }
};

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'polite');
  announcement.style.position = 'absolute';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.padding = '0';
  announcement.style.margin = '-1px';
  announcement.style.overflow = 'hidden';
  announcement.style.clip = 'rect(0, 0, 0, 0)';
  announcement.style.whiteSpace = 'nowrap';
  announcement.style.border = '0';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}; 