import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import OnboardingModal from '../OnboardingModal';
import { useAuth } from '../../hooks/useAuth';
import { useJourneys } from '../../hooks/useJourneys';

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useJourneys');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn<string | null, [string]>(),
  setItem: jest.fn<void, [string, string]>(),
  clear: jest.fn<void, []>(),
  removeItem: jest.fn<void, [string]>(),
  key: jest.fn<string | null, [number]>(),
  length: 0,
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Notification API
const mockRequestPermission = jest.fn();
global.Notification = {
  requestPermission: mockRequestPermission,
} as any;

describe('OnboardingModal', () => {
  const mockUser = { uid: 'test-user' };
  const mockJourneys = [
    {
      id: 'journey-1',
      title: 'Test Journey 1',
      description: 'Description 1',
      category: 'test',
      duration: 7,
      difficulty: 'beginner' as const,
    },
    {
      id: 'journey-2',
      title: 'Test Journey 2',
      description: 'Description 2',
      category: 'test',
      duration: 14,
      difficulty: 'intermediate' as const,
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    mockRequestPermission.mockResolvedValue('granted');

    // Mock hook implementations
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    (useJourneys as jest.Mock).mockReturnValue({
      journeys: mockJourneys,
      loading: false,
      error: null,
      suggestJourney: jest.fn().mockResolvedValue(true),
    });
  });

  it('shows modal on first login', () => {
    render(<OnboardingModal />);
    expect(screen.getByText('Welcome to Sparq Connection')).toBeInTheDocument();
  });

  it('does not show modal if onboarding is complete', () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('true');
    render(<OnboardingModal />);
    expect(screen.queryByText('Welcome to Sparq Connection')).not.toBeInTheDocument();
  });

  it('navigates through steps correctly', async () => {
    render(<OnboardingModal />);

    // Step 1: Welcome
    expect(screen.getByText('Welcome to Sparq Connection')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Journey Selection
    expect(screen.getByText('Find Your Path')).toBeInTheDocument();
    expect(screen.getByText('Test Journey 1')).toBeInTheDocument();
    expect(screen.getByText('Test Journey 2')).toBeInTheDocument();

    // Select a journey
    fireEvent.click(screen.getByText('Test Journey 1'));
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Notifications
    expect(screen.getByText('Stay Connected')).toBeInTheDocument();
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
  });

  it('allows going back to previous steps', () => {
    render(<OnboardingModal />);

    // Go to step 2
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Find Your Path')).toBeInTheDocument();

    // Go back to step 1
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Welcome to Sparq Connection')).toBeInTheDocument();
  });

  it('selects journey correctly', () => {
    render(<OnboardingModal />);

    // Go to journey selection step
    fireEvent.click(screen.getByText('Next'));

    // Select a journey
    const journey = screen.getByText('Test Journey 1');
    fireEvent.click(journey);

    // Verify selection (by checking if the card has the selected style)
    expect(journey.parentElement).toHaveStyle({ borderColor: '#4CAF50' });
  });

  it('requests notification permission', async () => {
    render(<OnboardingModal />);

    // Navigate to notifications step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    // Click enable notifications
    fireEvent.click(screen.getByText('Enable Notifications'));

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  it('completes onboarding process', async () => {
    const { suggestJourney } = useJourneys();
    render(<OnboardingModal />);

    // Complete all steps
    fireEvent.click(screen.getByText('Next')); // To journey selection
    fireEvent.click(screen.getByText('Test Journey 1')); // Select journey
    fireEvent.click(screen.getByText('Next')); // To notifications
    
    await act(async () => {
      fireEvent.click(screen.getByText('Get Started')); // Complete onboarding
    });

    // Verify onboarding completion
    expect(suggestJourney).toHaveBeenCalledWith('journey-1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboardingComplete', 'true');
  });

  it('handles notification permission denial gracefully', async () => {
    mockRequestPermission.mockResolvedValueOnce('denied');
    render(<OnboardingModal />);

    // Navigate to notifications step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    // Click enable notifications
    fireEvent.click(screen.getByText('Enable Notifications'));

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    // Should still allow completing onboarding
    expect(screen.getByText('Get Started')).toBeEnabled();
  });

  it('shows loading state for journeys', () => {
    (useJourneys as jest.Mock).mockReturnValue({
      journeys: [],
      loading: true,
      error: null,
      suggestJourney: jest.fn(),
    });

    render(<OnboardingModal />);
    fireEvent.click(screen.getByText('Next')); // To journey selection
    expect(screen.queryByText('Test Journey 1')).not.toBeInTheDocument();
  });

  it('handles journey loading error', () => {
    (useJourneys as jest.Mock).mockReturnValue({
      journeys: [],
      loading: false,
      error: 'Failed to load journeys',
      suggestJourney: jest.fn(),
    });

    render(<OnboardingModal />);
    fireEvent.click(screen.getByText('Next')); // To journey selection
    expect(screen.queryByText('Failed to load journeys')).toBeInTheDocument();
  });
}); 