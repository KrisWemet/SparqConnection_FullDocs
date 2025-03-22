import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeginStep } from '../journey/BeginStep';
import { Journey } from '../../types/journey';
import '@testing-library/jest-dom';

describe('BeginStep Component', () => {
  const mockJourney: Journey = {
    id: 'test-journey-1',
    title: 'Test Journey',
    description: 'A test journey',
    duration: 5,
    category: 'test',
    days: [
      {
        day: 1,
        title: 'Day 1',
        content: 'Test content',
        activities: ['Activity 1'],
      },
    ],
    progress: {
      currentDay: 1,
      reflections: {},
    },
  };

  const mockOnStart = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
      />
    );

    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
    expect(screen.getByText('Day 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Start Day 1');
  });

  it('calls onStart when start button is clicked', () => {
    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('disables start button when partner is behind', () => {
    const partnerProgress = {
      currentDay: 1,
      lastActivity: new Date(),
    };

    const journeyWithHigherProgress = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        currentDay: 3,
      },
    };

    render(
      <BeginStep
        journey={journeyWithHigherProgress}
        onStart={mockOnStart}
        partnerProgress={partnerProgress}
      />
    );

    const startButton = screen.getByRole('button');
    expect(startButton).toBeDisabled();
    expect(startButton).toHaveTextContent('Waiting for Partner');
    expect(screen.getByText(/Your partner needs to complete Day 1/)).toBeInTheDocument();
  });

  it('shows partner status when partner is behind', () => {
    const partnerProgress = {
      currentDay: 1,
      lastActivity: new Date(),
    };

    const journeyWithHigherProgress = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        currentDay: 3,
      },
    };

    render(
      <BeginStep
        journey={journeyWithHigherProgress}
        onStart={mockOnStart}
        partnerProgress={partnerProgress}
      />
    );

    expect(screen.getByText(/2 days behind/)).toBeInTheDocument();
  });

  it('allows proceeding on day 1 even if partner is behind', () => {
    const partnerProgress = {
      currentDay: 1,
      lastActivity: new Date(),
    };

    const journeyOnDayOne = {
      ...mockJourney,
      progress: {
        ...mockJourney.progress,
        currentDay: 1,
      },
    };

    render(
      <BeginStep
        journey={journeyOnDayOne}
        onStart={mockOnStart}
        partnerProgress={partnerProgress}
      />
    );

    const startButton = screen.getByRole('button');
    expect(startButton).not.toBeDisabled();
    expect(startButton).toHaveTextContent('Start Day 1');
  });

  it('shows tooltip with journey information', () => {
    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
      />
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute(
      'title',
      "Start your day with an introduction to today's theme and set your intention"
    );
  });

  it('handles animation states correctly', () => {
    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
      />
    );

    const container = screen.getByTestId('begin-step-container');
    expect(container).toHaveStyle('opacity: 0');
    
    // Wait for animation to complete
    setTimeout(() => {
      expect(container).toHaveStyle('opacity: 1');
    }, 100);
  });

  it('displays correct aria labels for accessibility', () => {
    render(
      <BeginStep
        journey={mockJourney}
        onStart={mockOnStart}
      />
    );

    const startButton = screen.getByRole('button');
    expect(startButton).toHaveAttribute('aria-label', 'Start Day 1');
  });
}); 