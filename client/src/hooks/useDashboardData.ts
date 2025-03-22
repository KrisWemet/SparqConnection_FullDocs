import { useState, useEffect } from 'react';
import { DashboardData } from '../types/dashboard';

export const useDashboardData = (userId?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // In a real app, you would fetch from your API
      // const response = await fetch(`/api/dashboard/${userId}`);
      // const result = await response.json();
      
      // For now, using mock data
      const mockData: DashboardData = {
        activities: [
          {
            id: '1',
            type: 'prompt',
            title: 'Daily Connection',
            date: new Date().toISOString(),
            duration: 15
          },
          {
            id: '2',
            type: 'quiz',
            title: 'Communication Styles',
            date: new Date().toISOString(),
            duration: 20,
            score: 85
          }
        ],
        progress: [
          {
            journeyId: '1',
            title: 'Communication Foundations',
            completionPercentage: 75,
            lastActivity: new Date().toISOString()
          },
          {
            journeyId: '2',
            title: 'Building Trust',
            completionPercentage: 30,
            lastActivity: new Date().toISOString()
          }
        ],
        points: 320,
        streak: 5,
        badges: [
          {
            type: 'achievement',
            name: 'First Steps',
            description: 'Completed your first activity',
            icon: 'footprints',
            earned_at: new Date().toISOString()
          }
        ]
      };
      
      setData(mockData);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

export default useDashboardData; 