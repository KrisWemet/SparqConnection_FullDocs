import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import JourneyDashboard from '../JourneyDashboard';
import { useAuth } from '../../hooks/useAuth';

// Mock the modules
jest.mock('axios');
jest.mock('../../hooks/useAuth');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockJourneys = [
  {
    journeyId: 'journey1',
    title: '5 Love Languages',
    description: 'Discover your love language',
    totalDays: 5,
    completedDays: 3,
    currentDay: 4,
    startedAt: '2024-03-17T00:00:00.000Z',
    lastActivity: '2024-03-19T00:00:00.000Z',
    isComplete: false,
  },
  {
    journeyId: 'journey2',
    title: 'Communication Skills',
    description: 'Improve your communication',
    totalDays: 7,
    completedDays: 7,
    currentDay: 7,
    startedAt: '2024-03-10T00:00:00.000Z',
    lastActivity: '2024-03-16T00:00:00.000Z',
    isComplete: true,
  },
];

describe('JourneyDashboard', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    (axios.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load journey progress')).toBeInTheDocument();
    });
  });

  it('displays empty state when no journeys are available', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You haven't started any journeys yet.")).toBeInTheDocument();
      expect(screen.getByText('Explore Journeys')).toBeInTheDocument();
    });
  });

  it('displays journey cards with correct information', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockJourneys } });

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // First journey
      expect(screen.getByText('5 Love Languages')).toBeInTheDocument();
      expect(screen.getByText('3/5 days')).toBeInTheDocument();
      expect(screen.getByText('Day 4')).toBeInTheDocument();
      expect(screen.getByText('Resume Journey')).toBeInTheDocument();

      // Second journey
      expect(screen.getByText('Communication Skills')).toBeInTheDocument();
      expect(screen.getByText('7/7 days')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Review Journey')).toBeInTheDocument();
    });
  });

  it('makes API call with correct authorization header', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockJourneys } });

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/journeys/userProgress',
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-token' },
        })
      );
    });
  });

  it('displays last activity date correctly', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockJourneys } });

    render(
      <BrowserRouter>
        <JourneyDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Last activity: 3\/19\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/Last activity: 3\/16\/2024/)).toBeInTheDocument();
    });
  });
}); 