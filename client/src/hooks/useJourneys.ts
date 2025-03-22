import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

interface Journey {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function useJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const journeyCollection = collection(db, 'journeys');
      const snapshot = await getDocs(journeyCollection);
      const journeyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Journey[];

      setJourneys(journeyData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch journeys');
      setLoading(false);
      console.error('Error fetching journeys:', err);
    }
  };

  const suggestJourney = async (journeyId: string) => {
    try {
      const journeyRef = doc(db, 'journeys', journeyId);
      await updateDoc(journeyRef, {
        suggestedCount: increment(1),
      });
      return true;
    } catch (err) {
      console.error('Error suggesting journey:', err);
      return false;
    }
  };

  return {
    journeys,
    loading,
    error,
    suggestJourney,
  };
} 