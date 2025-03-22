import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface JourneyProgress {
  journeyId: string;
  title: string;
  description: string;
  totalDays: number;
  completedDays: number;
  currentDay: number;
  startedAt: string | null;
  lastActivity: string | null;
  isComplete: boolean;
}

const JourneyDashboard: React.FC = () => {
  const [journeys, setJourneys] = useState<JourneyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchJourneyProgress = async () => {
      try {
        const response = await axios.get('/api/journeys/userProgress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJourneys(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load journey progress');
        setLoading(false);
      }
    };

    fetchJourneyProgress();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Your Journey Dashboard</h2>
        <p className="text-gray-600 mb-6">You haven't started any journeys yet.</p>
        <Link
          to="/journeys"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Explore Journeys
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Your Journey Dashboard</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {journeys.map((journey, index) => (
          <motion.div
            key={journey.journeyId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{journey.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{journey.description}</p>
              
              {/* Progress bar */}
              <div className="relative h-4 bg-gray-200 rounded-full mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(journey.completedDays / journey.totalDays) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute h-full bg-purple-500 rounded-full"
                />
                <span className="absolute right-0 top-6 text-sm text-gray-600">
                  {journey.completedDays}/{journey.totalDays} days
                </span>
              </div>

              {/* Status and action button */}
              <div className="mt-8 flex items-center justify-between">
                <span className={`text-sm ${journey.isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                  {journey.isComplete ? 'Completed' : `Day ${journey.currentDay}`}
                </span>
                
                <Link
                  to={`/journeys/${journey.journeyId}/day/${journey.currentDay}`}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${journey.isComplete
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'}
                  `}
                >
                  {journey.isComplete ? 'Review Journey' : 'Resume Journey'}
                </Link>
              </div>

              {/* Last activity */}
              {journey.lastActivity && (
                <p className="text-xs text-gray-500 mt-4">
                  Last activity: {new Date(journey.lastActivity).toLocaleDateString()}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JourneyDashboard; 