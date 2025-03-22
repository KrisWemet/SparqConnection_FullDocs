import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Journey } from '../journey/Journey';
import { useAuth } from '../../hooks/useAuth';
import { useJourney } from '../../hooks/useJourney';

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useJourney');

// Mock the Material-UI components
jest.mock('@mui/material', () => ({
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ),
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

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
    },
  };

  const mockUseJourney = {
    journey: mockJourney,
    loading: false,
    error: null,
    updateProgress: jest.fn(),
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { _id: 'testUserId' },
    });
    (useJourney as jest.Mock).mockReturnValue(mockUseJourney);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders journey title and description', () => {
    render(<Journey journeyId="journey1" />);

    expect(screen.getByText('5 Love Languages')).toBeInTheDocument();
    expect(screen.getByText('Discover your love language')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useJourney as jest.Mock).mockReturnValue({
      ...mockUseJourney,
      loading: true,
    });

    render(<Journey journeyId="journey1" />);

    expect(screen.getByTestId('journey-loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useJourney as jest.Mock).mockReturnValue({
      ...mockUseJourney,
      error: 'Failed to load journey',
    });

    render(<Journey journeyId="journey1" />);

    expect(screen.getByText('Failed to load journey')).toBeInTheDocument();
  });

  describe('Journey Steps with Tooltips', () => {
    it('renders Begin step with tooltip initially', () => {
      render(<Journey journeyId="journey1" />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute(
        'data-title',
        "Start your day with an introduction to today's theme and set your intention"
      );
      expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
      expect(screen.getByText('Start Day 1')).toBeInTheDocument();
    });

    it('navigates to Share step with tooltip when clicking Start', () => {
      render(<Journey journeyId="journey1" />);

      fireEvent.click(screen.getByText('Start Day 1'));

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute(
        'data-title',
        "Learn about today's activities and prepare to engage with your partner"
      );
      expect(screen.getByText('Words of Affirmation')).toBeInTheDocument();
      expect(screen.getByText('Express love through words')).toBeInTheDocument();
    });

    it('displays activities in Share step', () => {
      render(<Journey journeyId="journey1" />);
      fireEvent.click(screen.getByText('Start Day 1'));

      mockJourney.days[0].activities.forEach(activity => {
        expect(screen.getByText(activity)).toBeInTheDocument();
      });
    });

    it('navigates to Reflect step with tooltip and submits reflection', async () => {
      render(<Journey journeyId="journey1" />);

      // Navigate to Share step
      fireEvent.click(screen.getByText('Start Day 1'));

      // Navigate to Reflect step
      fireEvent.click(screen.getByText('Continue to Reflection'));

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute(
        'data-title',
        'Take time to write down your thoughts and experiences from the activities'
      );

      // Type reflection
      const reflectionInput = screen.getByPlaceholderText('Share your thoughts and experiences...');
      await userEvent.type(reflectionInput, 'This was a great experience!');

      // Submit reflection
      fireEvent.click(screen.getByText('Submit Reflection'));

      expect(mockUseJourney.updateProgress).toHaveBeenCalledWith({
        journeyId: 'journey1',
        day: 1,
        reflection: 'This was a great experience!',
      });
    });

    it('shows validation error for empty reflection', async () => {
      render(<Journey journeyId="journey1" />);

      // Navigate to Share step
      fireEvent.click(screen.getByText('Start Day 1'));

      // Navigate to Reflect step
      fireEvent.click(screen.getByText('Continue to Reflection'));

      // Submit without entering reflection
      fireEvent.click(screen.getByText('Submit Reflection'));

      expect(screen.getByText('Reflection is required')).toBeInTheDocument();
      expect(mockUseJourney.updateProgress).not.toHaveBeenCalled();
    });

    it('navigates to Align step with tooltip after successful reflection', async () => {
      render(<Journey journeyId="journey1" />);

      // Navigate through steps
      fireEvent.click(screen.getByText('Start Day 1'));
      fireEvent.click(screen.getByText('Continue to Reflection'));

      // Submit reflection
      const reflectionInput = screen.getByPlaceholderText('Share your thoughts and experiences...');
      await userEvent.type(reflectionInput, 'This was a great experience!');
      fireEvent.click(screen.getByText('Submit Reflection'));

      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip');
        expect(tooltip).toHaveAttribute(
          'data-title',
          "Review your progress and prepare for tomorrow's journey"
        );
        expect(screen.getByText('Day 1 Complete!')).toBeInTheDocument();
      });
    });

    it('navigates to Focus step with tooltip', async () => {
      render(<Journey journeyId="journey1" />);

      // Navigate through steps
      fireEvent.click(screen.getByText('Start Day 1'));
      fireEvent.click(screen.getByText('Continue to Reflection'));
      const reflectionInput = screen.getByPlaceholderText('Share your thoughts and experiences...');
      await userEvent.type(reflectionInput, 'This was a great experience!');
      fireEvent.click(screen.getByText('Submit Reflection'));

      // Navigate to Focus step
      await waitFor(() => {
        fireEvent.click(screen.getByText('Start Daily Focus Activity'));
      });

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute(
        'data-title',
        "Complete today's mindfulness activity to strengthen your connection"
      );
      expect(screen.getByText('Daily Focus Activity')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on interactive elements', () => {
      render(<Journey journeyId="journey1" />);

      expect(screen.getByLabelText('Start Day 1')).toBeInTheDocument();

      // Navigate to reflection step
      fireEvent.click(screen.getByText('Start Day 1'));
      fireEvent.click(screen.getByText('Continue to Reflection'));

      expect(screen.getByLabelText('Reflection input')).toBeInTheDocument();
      expect(screen.getByLabelText('Submit reflection')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('displays current day progress', () => {
      render(<Journey journeyId="journey1" />);

      expect(screen.getByText('Day 1 of 5')).toBeInTheDocument();
    });

    it('shows completed days with checkmarks', () => {
      const journeyWithProgress = {
        ...mockJourney,
        progress: {
          currentDay: 2,
          reflections: {
            '1': {
              completed: true,
              reflection: 'Great experience',
              timestamp: new Date(),
            },
          },
        },
      };

      (useJourney as jest.Mock).mockReturnValue({
        ...mockUseJourney,
        journey: journeyWithProgress,
      });

      render(<Journey journeyId="journey1" />);

      expect(screen.getByTestId('day-1-completed')).toBeInTheDocument();
    });
  });
}); 