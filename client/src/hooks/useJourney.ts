import { useState, useEffect } from 'react';
import { Journey } from '../types/journey';

export interface JourneyContextType {
  journey: Journey | null;
  loading: boolean;
  error: string | null;
  fetchJourney: (id: string) => Promise<void>;
}

export const useJourney = (journeyId: string): JourneyContextType => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourney = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/journeys/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch journey');
      }
      const data = await response.json();
      setJourney(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney(journeyId);
  }, [journeyId]);

  return { journey, loading, error, fetchJourney };
}; 