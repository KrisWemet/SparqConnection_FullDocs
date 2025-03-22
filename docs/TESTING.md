# Sparq Connection Testing Documentation

## Overview

This document outlines the testing strategy and practices for the Sparq Connection application. We use Jest as our primary testing framework, along with React Testing Library for frontend component testing.

## Test Coverage Goals

- Backend Routes: 80% coverage
- Frontend Components: 80% coverage
- Critical User Journeys: 100% coverage
- Partner Sync Features: 100% coverage

## Testing Stack

- **Jest**: Primary testing framework
- **React Testing Library**: Frontend component testing
- **jest-mock-express**: Express route testing
- **@testing-library/jest-dom**: DOM testing utilities
- **@testing-library/user-event**: User interaction simulation

## Directory Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── __tests__/           # Component tests
│   │   │   └── journey/
│   │   └── utils/
│   │       └── __tests__/           # Utility tests
└── server/
    ├── routes/
    │   └── __tests__/              # Route tests
    └── controllers/
        └── __tests__/              # Controller tests
```

## Testing Categories

### 1. Backend Route Testing

Backend routes are tested using `jest-mock-express` to simulate HTTP requests and responses. Focus areas include:

- Request validation
- Error handling
- Partner synchronization
- Data encryption/decryption
- Edge cases

Example test for journey progress route:

```typescript
describe('Journey Progress Routes', () => {
  it('should update progress and sync with partner', async () => {
    const req = mockRequest({
      body: {
        journeyId: 'test-journey',
        currentDay: 1,
        reflection: 'encrypted-data',
        iv: 'test-iv'
      },
      user: { id: 'test-user' }
    });
    const res = mockResponse();

    await updateJourneyProgress(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Progress updated successfully'
    });
  });
});
```

### 2. Frontend Component Testing

Components are tested using React Testing Library with a focus on user interactions and accessibility. Key areas include:

- Rendering
- User interactions
- Partner sync states
- Accessibility
- Animations
- Error states

Example test for BeginStep component:

```typescript
describe('BeginStep Component', () => {
  it('handles partner sync states correctly', () => {
    const partnerProgress = {
      currentDay: 1,
      lastActivity: new Date()
    };

    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
        partnerProgress={partnerProgress}
      />
    );

    expect(screen.getByText(/2 days behind/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Integration Testing

Integration tests focus on the interaction between components and services:

- Journey progression flow
- Partner synchronization
- Data persistence
- Encryption/decryption flow

### 4. End-to-End Testing

Critical user journeys that require end-to-end testing:

1. Complete Journey Flow
   - Start journey
   - Progress through days
   - Partner sync points
   - Completion

2. Partner Synchronization
   - Progress updates
   - Notifications
   - Conflict resolution

3. Data Security
   - Encryption
   - Decryption
   - Key management

## Test Data

We maintain a set of mock data for testing:

```typescript
const mockJourney = {
  id: 'test-journey-1',
  title: 'Test Journey',
  duration: 5,
  days: [
    {
      day: 1,
      title: 'Day 1',
      content: 'Test content',
      activities: ['Activity 1']
    }
  ],
  progress: {
    currentDay: 1,
    reflections: {}
  }
};
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- BeginStep.test.tsx

# Watch mode
npm test -- --watch
```

### CI/CD Pipeline

Tests are automatically run in the CI/CD pipeline:
1. Unit tests
2. Integration tests
3. Coverage report generation
4. Build verification

## Best Practices

1. **Test Organization**
   - Group related tests using `describe`
   - Use clear test descriptions
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Mock external dependencies
   - Use meaningful mock data
   - Clean up mocks after tests

3. **Assertions**
   - Test component behavior, not implementation
   - Focus on user-visible outcomes
   - Test accessibility features

4. **Coverage**
   - Maintain minimum 80% coverage
   - Focus on critical paths
   - Document uncovered edge cases

## Common Testing Patterns

### 1. Partner Sync Testing

```typescript
it('handles partner sync failure gracefully', async () => {
  // Arrange
  const mockError = new Error('Sync failed');
  mockSyncWithPartner.mockRejectedValue(mockError);

  // Act
  await updateProgress(mockData);

  // Assert
  expect(errorHandler).toHaveBeenCalledWith(mockError);
  expect(notifyUser).toHaveBeenCalled();
});
```

### 2. Animation Testing

```typescript
it('applies correct animation states', () => {
  const { container } = render(<Component />);
  
  expect(container).toHaveStyle({ opacity: 0 });
  
  // Wait for animation
  act(() => {
    jest.advanceTimersByTime(300);
  });
  
  expect(container).toHaveStyle({ opacity: 1 });
});
```

### 3. Accessibility Testing

```typescript
it('meets accessibility requirements', () => {
  const { container } = render(<Component />);
  expect(axe(container)).toHaveNoViolations();
});
```

## Troubleshooting

Common testing issues and solutions:

1. **Async Test Failures**
   - Use `async/await`
   - Implement proper cleanup
   - Check timing issues

2. **Component Re-render Issues**
   - Check effect dependencies
   - Use `act()` when needed
   - Verify state updates

3. **Mock Data Problems**
   - Verify mock data structure
   - Clean up between tests
   - Check mock timing

## Contributing

When adding new tests:

1. Follow existing patterns
2. Update documentation
3. Verify coverage
4. Add meaningful descriptions
5. Include edge cases 

# Manual Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing Sparq Connection's features. Each section includes test scenarios, expected outcomes, and verification points.

## Pre-testing Setup

### Environment Preparation
1. Clear browser cache and cookies
2. Use Chrome DevTools device emulation for mobile testing
3. Prepare two test accounts for partner synchronization
4. Enable network throttling for connection testing

### Test Accounts
```typescript
const TEST_ACCOUNTS = {
  partner1: {
    email: 'test1@sparqconnection.com',
    password: 'TestPass123!'
  },
  partner2: {
    email: 'test2@sparqconnection.com',
    password: 'TestPass123!'
  }
};
```

## Core Features Testing

### 1. Authentication Flow
- [ ] New user registration
  1. Navigate to signup page
  2. Enter valid credentials
  3. Verify email verification sent
  4. Complete email verification
  5. Check redirect to onboarding

- [ ] Existing user login
  1. Enter valid credentials
  2. Verify successful login
  3. Check persistence of session
  4. Test "Remember Me" functionality

- [ ] Password reset
  1. Request password reset
  2. Verify email receipt
  3. Complete reset process
  4. Confirm new password works

### 2. Partner Synchronization
- [ ] Partner invitation
  1. Generate invitation link
  2. Send to partner email
  3. Verify partner receives invite
  4. Check invitation expiry

- [ ] Account linking
  1. Accept partner invitation
  2. Verify both accounts linked
  3. Check relationship status
  4. Test unlinking process

### 3. Daily Connection Log
- [ ] Daily entry creation
  1. Navigate to daily log
  2. Add action item
  3. Set mood rating
  4. Add reflection
  5. Save entry

- [ ] Entry validation
  1. Try submitting empty form
  2. Test character limits
  3. Verify one entry per day
  4. Check edit timeframe

- [ ] History view
  1. View past entries
  2. Check filtering options
  3. Verify statistics
  4. Test export function

### 4. Journey Feature
- [ ] Journey creation
  1. Start new journey
  2. Set goals and timeframe
  3. Add milestones
  4. Save journey plan

- [ ] Progress tracking
  1. Update milestone status
  2. Add progress notes
  3. Check completion tracking
  4. Verify partner sync

- [ ] Journey sharing
  1. Share journey details
  2. Test privacy settings
  3. Verify partner access
  4. Check notifications

### 5. Messaging System
- [ ] Direct messages
  1. Send text message
  2. Check delivery status
  3. Verify notifications
  4. Test offline behavior

- [ ] Media sharing
  1. Upload image
  2. Share document
  3. Check preview generation
  4. Verify file size limits

- [ ] Chat features
  1. Test emoji support
  2. Use message reactions
  3. Check read receipts
  4. Test message editing

## Progressive Web App Features

### 1. Offline Functionality
- [ ] Service worker
  1. Disable network
  2. Verify cached content
  3. Test offline actions
  4. Check sync on reconnect

- [ ] Data persistence
  1. Create offline entry
  2. Check local storage
  3. Verify sync queue
  4. Test conflict resolution

### 2. Installation
- [ ] Add to home screen
  1. Trigger install prompt
  2. Complete installation
  3. Check app icon
  4. Verify launch behavior

### 3. Push Notifications
- [ ] Permission handling
  1. Request notification permission
  2. Handle user choice
  3. Test preference saving
  4. Check multi-device sync

- [ ] Notification delivery
  1. Send test notification
  2. Check delivery time
  3. Verify action handling
  4. Test quiet hours

## Performance Testing

### 1. Load Times
- [ ] Initial load
  1. Measure first paint
  2. Check TTI (Time to Interactive)
  3. Verify asset loading
  4. Test compression

- [ ] Navigation
  1. Check route changes
  2. Measure animation smoothness
  3. Test back/forward cache
  4. Verify lazy loading

### 2. Resource Usage
- [ ] Memory consumption
  1. Monitor heap usage
  2. Check for leaks
  3. Test long sessions
  4. Verify cleanup

- [ ] Battery impact
  1. Monitor background activity
  2. Check location usage
  3. Test push efficiency
  4. Verify wake locks

## Security Testing

### 1. Authentication
- [ ] Session management
  1. Check token expiry
  2. Test concurrent sessions
  3. Verify logout behavior
  4. Check remember me

- [ ] Access control
  1. Test protected routes
  2. Verify role permissions
  3. Check API endpoints
  4. Test CORS policies

### 2. Data Protection
- [ ] Input validation
  1. Test XSS prevention
  2. Check SQL injection
  3. Verify file uploads
  4. Test data sanitization

- [ ] Encryption
  1. Verify HTTPS
  2. Check data at rest
  3. Test key rotation
  4. Verify backups

## Accessibility Testing

### 1. Screen Readers
- [ ] Navigation
  1. Test keyboard focus
  2. Check ARIA labels
  3. Verify heading structure
  4. Test skip links

- [ ] Interactive elements
  1. Check button labels
  2. Test form controls
  3. Verify error messages
  4. Check color contrast

### 2. Keyboard Navigation
- [ ] Core functions
  1. Test all interactions
  2. Check focus trapping
  3. Verify shortcuts
  4. Test modal handling

## Test Reporting

### 1. Issue Documentation
```markdown
## Issue Template
- Feature: [Feature Name]
- Severity: [Critical/High/Medium/Low]
- Steps to Reproduce:
  1. [Step 1]
  2. [Step 2]
- Expected Result: [Description]
- Actual Result: [Description]
- Environment: [Details]
- Screenshots: [If applicable]
```

### 2. Test Results
- Document all test outcomes
- Include screenshots/recordings
- Note environment details
- Track issue resolution

## Regression Testing

### 1. Critical Paths
- [ ] User registration flow
- [ ] Partner synchronization
- [ ] Daily log submission
- [ ] Journey creation
- [ ] Message exchange

### 2. Feature Dependencies
- [ ] Authentication impact
- [ ] Data synchronization
- [ ] Offline capabilities
- [ ] Push notifications

## Best Practices

1. **Test Documentation**
   - Keep detailed notes
   - Update test cases regularly
   - Document environment setup
   - Track test coverage

2. **Testing Schedule**
   - Regular regression testing
   - Pre-release validation
   - Post-deployment verification
   - Performance monitoring

3. **Issue Management**
   - Use priority system
   - Track bug lifecycle
   - Document workarounds
   - Verify fixes 