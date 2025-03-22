import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Gamification from '../components/Gamification';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock timer
jest.useFakeTimers();

describe('Gamification Component', () => {
  const mockGamificationData = {
    points: 100,
    current_streak: 5,
    longest_streak: 7,
    total_quizzes_completed: 10,
    perfect_scores: 3,
    daily_responses: 15,
    badges: [
      {
        type: 'achievement',
        name: 'First Response',
        description: 'Completed your first prompt',
        icon: '/badges/first-response.svg',
        earned_at: new Date()
      }
    ]
  };

  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  it('should fetch and display gamification stats on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockGamificationData });

    render(<Gamification />);

    // Should show loading initially
    expect(screen.getByText(/loading gamification stats/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('First Response')).toBeInTheDocument();
    });

    // Should have made the initial API call
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should poll for updates at regular intervals', async () => {
    // Initial data
    mockedAxios.get.mockResolvedValueOnce({ data: mockGamificationData });

    render(<Gamification />);

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Updated data for second poll
    const updatedData = {
      ...mockGamificationData,
      points: 150,
      current_streak: 6
    };
    mockedAxios.get.mockResolvedValueOnce({ data: updatedData });

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Wait for updated data
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('6 days')).toBeInTheDocument();
    });

    // Should have made two API calls (initial + one poll)
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should handle errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<Gamification />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch gamification stats/i)).toBeInTheDocument();
    });
  });

  it('should cleanup polling on unmount', () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockGamificationData });

    const { unmount } = render(<Gamification />);

    // Fast-forward past several polling intervals
    act(() => {
      jest.advanceTimersByTime(100000);
    });

    // Unmount component
    unmount();

    // Advance timer again
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // No additional API calls should be made after unmount
    expect(mockedAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 polls before unmount
  });
}); 