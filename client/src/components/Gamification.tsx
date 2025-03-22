import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth'; // Assuming you have an auth context

interface Badge {
  type: string;
  name: string;
  description: string;
  earned_at: string | Date;
  icon: string;
}

interface GamificationStats {
  points: number;
  current_streak: number;
  longest_streak: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  daily_responses: number;
  badges: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    earned_at: Date;
  }>;
  quiz_categories_completed: string[];
  mood_entries: number;
}

interface BadgeRequirement {
  type: string;
  name: string;
  description: string;
  icon: string;
}

const POLLING_INTERVAL = 30000; // 30 seconds

const Gamification: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (user?.uid) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { userId: user.uid },
        withCredentials: true
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user?.uid]);

  // Handle real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('gamificationUpdate', (data: Partial<GamificationStats>) => {
      setStats(prevStats => {
        if (!prevStats) return prevStats;
        
        // Check for new badges
        if (data.badges && data.badges.length > prevStats.badges.length) {
          const newBadge = data.badges[data.badges.length - 1];
          setNewBadge(newBadge);
          setTimeout(() => setNewBadge(null), 5000);
        }

        return {
          ...prevStats,
          ...data
        };
      });
    });

    return () => {
      socket.off('gamificationUpdate');
    };
  }, [socket]);

  const fetchGamificationStats = useCallback(async () => {
    try {
      const response = await axios.get<GamificationStats>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/gamification/status`
      );
      setStats(response.data);
      setAllBadges(response.data.badges.map((badge) => ({
        type: badge.type,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })));
      setError(null);
    } catch (err) {
      setError('Failed to fetch gamification stats');
      console.error('Error fetching gamification stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchGamificationStats();

    // Set up polling
    const pollInterval = setInterval(fetchGamificationStats, POLLING_INTERVAL);

    // Cleanup polling on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchGamificationStats]);

  // Animation variants for points and streak updates
  const numberVariants = {
    initial: { scale: 1 },
    update: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
          <motion.div 
            className="text-3xl font-bold text-primary-600"
            variants={numberVariants}
            initial="initial"
            animate="update"
            key={stats.points} // Force animation on value change
          >
            {stats.points}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Streak</h3>
          <motion.div 
            className="text-3xl font-bold text-primary-600"
            variants={numberVariants}
            initial="initial"
            animate="update"
            key={stats.current_streak} // Force animation on value change
          >
            {stats.current_streak} days
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Badges Earned</h3>
          <motion.div 
            className="text-3xl font-bold text-primary-600"
            variants={numberVariants}
            initial="initial"
            animate="update"
            key={stats.badges.length} // Force animation on value change
          >
            {stats.badges.length} / {allBadges.length}
          </motion.div>
        </motion.div>
      </div>

      {/* Badge Collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Badge Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allBadges.map((badge) => {
            const earned = stats.badges.find(b => b.type === badge.type);
            return (
              <motion.div
                key={badge.type}
                whileHover={{ scale: 1.05 }}
                className={`relative p-4 rounded-lg text-center ${
                  earned ? 'bg-primary-50' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl ${
                    earned ? 'bg-primary-100' : 'bg-gray-200'
                  }`}
                >
                  {badge.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                {earned && (
                  <p className="text-xs text-primary-600 mt-2">
                    Earned {new Date(earned.earned_at).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* New Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{newBadge.icon}</span>
              <div>
                <h4 className="font-semibold">New Badge Earned!</h4>
                <p className="text-sm">{newBadge.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gamification; 