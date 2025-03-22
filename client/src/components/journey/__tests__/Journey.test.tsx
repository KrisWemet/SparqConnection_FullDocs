import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Journey } from '../Journey';
import { useJourney } from '../../../hooks/useJourney';
import { useAuth } from '../../../hooks/useAuth';
import { useFCM } from '../../../hooks/useFCM';
import { encrypt } from '../../../utils/encryption';

// Mock hooks
jest.mock('../../../hooks/useJourney');
jest.mock('../../../hooks/useAuth');
jest.mock('../../../hooks/useFCM');
jest.mock('../../../utils/encryption');

describe('Journey Component', () => {
  const mockJourney = {
    id: 'journey1',
    title: '5 Love Languages',
    description: 'Discover your love language',
    duration: 5,
    days: [
      {
        day: 1,
        title: 'Words of Affirmation',
        content: 'Express love through words',
        activities: ['Write a love letter', 'Give 3 compliments'],
      },
    ],
    progress: {
      currentDay: 1,
      reflections: {},
      partnerSyncStatus: 'pending',
      lastActivity: new Date(),
    },
    partnerId: 'partner1',
    partnerProgress: {
      currentDay: 1,
      lastActivity: new Date(),
    },
  };

  const mockUser = {
    _id: 'user1',
    email: 'test@example.com',
    name: 'Test User',
    privateKey: 'test-key-123',
    token: 'test-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (useJourney as jest.Mock).mockReturnValue({
      journey: mockJourney,
      loading: false,
      error: null,
      updateProgress: jest.fn(),
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (useFCM as jest.Mock).mockReturnValue({
      sendNotification: jest.fn(),
    });

    (encrypt as jest.Mock).mockReturnValue({
      data: 'encrypted-data',
      iv: 'test-iv',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders journey title and description', () => {
    render(<Journey journeyId="journey1" />);

    expect(screen.getByText('5 Love Languages')).toBeInTheDocument();
    expect(screen.getByText('Discover your love language')).toBeInTheDocument();
  });

  it('shows partner status when partner is behind', async () => {
    const journeyWithLaggedPartner = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        currentDay: 3,
      },
      partnerProgress: {
        currentDay: 1,
        lastActivity: new Date(),
      },
    };

    (useJourney as jest.Mock).mockReturnValue({
      journey: journeyWithLaggedPartner,
      loading: false,
      error: null,
      updateProgress: jest.fn(),
    });

    render(<Journey journeyId="journey1" />);

    expect(screen.getByText(/Your partner is on Day 1/)).toBeInTheDocument();
    expect(screen.getByText(/2 days behind/)).toBeInTheDocument();
  });

  it('encrypts reflection before submission', async () => {
    const updateProgress = jest.fn();
    (useJourney as jest.Mock).mockReturnValue({
      journey: mockJourney,
      loading: false,
      error: null,
      updateProgress,
    });

    render(<Journey journeyId="journey1" />);

    // Navigate to reflection step
    fireEvent.click(screen.getByText('Start Day 1'));
    fireEvent.click(screen.getByText('Continue to Reflection'));

    // Enter and submit reflection
    await userEvent.type(
      screen.getByPlaceholderText('Share your thoughts and experiences...'),
      'Test reflection'
    );
    fireEvent.click(screen.getByText('Submit Reflection'));

    expect(encrypt).toHaveBeenCalledWith('Test reflection', mockUser.privateKey);
    expect(updateProgress).toHaveBeenCalledWith({
      journeyId: 'journey1',
      day: 1,
      reflection: 'encrypted-data',
      iv: 'test-iv',
    });
  });

  it('sends notification when partner falls behind', async () => {
    const sendNotification = jest.fn();
    (useFCM as jest.Mock).mockReturnValue({
      sendNotification,
    });

    const journeyWithLaggedPartner = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        currentDay: 3,
      },
      partnerProgress: {
        currentDay: 1,
        lastActivity: new Date(),
      },
    };

    (useJourney as jest.Mock).mockReturnValue({
      journey: journeyWithLaggedPartner,
      loading: false,
      error: null,
      updateProgress: jest.fn(),
    });

    render(<Journey journeyId="journey1" />);

    await waitFor(() => {
      expect(sendNotification).toHaveBeenCalledWith('partner1', {
        title: 'Journey Update',
        body: 'Your partner is waiting for you! Continue your journey together.',
        data: {
          type: 'journey_reminder',
          journeyId: 'journey1',
        },
      });
    });
  });

  it('prevents progression when waiting for partner', () => {
    const journeyWithWaitingStatus = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        partnerSyncStatus: 'waiting',
      },
    };

    (useJourney as jest.Mock).mockReturnValue({
      journey: journeyWithWaitingStatus,
      loading: false,
      error: null,
      updateProgress: jest.fn(),
    });

    render(<Journey journeyId="journey1" />);

    const startButton = screen.getByText('Waiting for Partner');
    expect(startButton).toBeDisabled();
    expect(screen.getByText(/Your partner needs to complete/)).toBeInTheDocument();
  });
}); 