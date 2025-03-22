import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Journey, JourneyProgress } from '../types/journey';
import { JourneyContextType } from '../hooks/useJourney';

export const JourneyContext = createContext<JourneyContextType | null>(null);

interface JourneyProviderProps {
  children: ReactNode;
}

export const JourneyProvider: React.FC<JourneyProviderProps> = ({ children }) => {
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProgress = useCallback(async (progress: Partial<JourneyProgress>) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update progress
      setJourneyProgress(prev => ({ ...prev!, ...progress }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update progress'));
    } finally {
      setLoading(false);
    }
  }, []);

  const startJourney = useCallback(async (journeyId: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call to start journey
      // For now, just create a basic journey structure
      const newJourney: Journey = {
        id: journeyId,
        title: 'New Journey',
        description: 'A new journey begins',
        duration: 30,
        days: [],
        progress: {
          currentDay: 1,
          completedDays: [],
          reflections: {},
          partnerSyncStatus: 'not_synced',
          lastActivity: {
            type: 'started',
            timestamp: new Date().toISOString(),
            description: 'Journey started'
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentJourney(newJourney);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start journey'));
    } finally {
      setLoading(false);
    }
  }, []);

  const completeStep = useCallback(async (stepId: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call to complete step
      if (currentJourney && journeyProgress) {
        const updatedProgress = {
          ...journeyProgress,
          completedDays: [...journeyProgress.completedDays, currentJourney.progress.currentDay],
          currentDay: currentJourney.progress.currentDay + 1,
          lastActivity: {
            type: 'completed_step',
            timestamp: new Date().toISOString(),
            description: `Completed step ${stepId}`
          }
        };
        setJourneyProgress(updatedProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete step'));
    } finally {
      setLoading(false);
    }
  }, [currentJourney, journeyProgress]);

  const saveJourneyData = useCallback(async (data: Partial<Journey>) => {
    try {
      setLoading(true);
      // TODO: Implement API call to save journey data
      setCurrentJourney(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save journey data'));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <JourneyContext.Provider
      value={{
        journey: currentJourney,
        loading,
        error: error?.message || null,
        fetchJourney: startJourney
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}; 