import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';

interface Expert {
  name: string;
  credentials: string;
  avatar?: {
    asset: {
      url: string;
    };
  };
}

interface Tip {
  _id: string;
  title: string;
  content: any[];
  points_required: number;
  category: string;
  expert?: Expert;
  is_unlocked: boolean;
  points_needed: number;
  publishedAt: string;
}

interface TipsByCategory {
  [key: string]: Tip[];
}

const ExpertAdvice: React.FC = () => {
  const [tips, setTips] = useState<TipsByCategory>({});
  const [userPoints, setUserPoints] = useState(0);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressStats, setProgressStats] = useState({
    totalTips: 0,
    unlockedTips: 0,
    nextUnlockPoints: 0
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to view expert advice');
      setLoading(false);
      return;
    }

    const fetchExpertAdvice = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expert-advice', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTips(response.data.tips_by_category);
        setUserPoints(response.data.user_points);

        // Calculate progress stats
        let totalTips = 0;
        let unlockedTips = 0;
        let nextUnlockPoints = Infinity;

        Object.values(response.data.tips_by_category).forEach((categoryTips: any) => {
          (categoryTips as Tip[]).forEach(tip => {
            totalTips++;
            if (tip.is_unlocked) {
              unlockedTips++;
            } else if (tip.points_required < nextUnlockPoints) {
              nextUnlockPoints = tip.points_required;
            }
          });
        });

        setProgressStats({
          totalTips,
          unlockedTips,
          nextUnlockPoints: nextUnlockPoints === Infinity ? 0 : nextUnlockPoints
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load expert advice');
        setLoading(false);
      }
    };

    fetchExpertAdvice();
  }, [token]);

  const handleTipClick = async (tip: Tip) => {
    if (!tip.is_unlocked) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/expert-advice/${tip._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTip(response.data);
    } catch (err) {
      setError('Failed to load tip details');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expert Relationship Advice</h1>
      
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="mb-2 md:mb-0">
            <p className="text-lg">Your Points: <span className="font-bold text-blue-600">{userPoints}</span></p>
            <p className="text-sm text-gray-600">
              Tips Unlocked: {progressStats.unlockedTips} / {progressStats.totalTips}
            </p>
          </div>
          {progressStats.nextUnlockPoints > userPoints && (
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-800">
                Next tip unlocks at: <span className="font-bold">{progressStats.nextUnlockPoints}</span> points
                <br />
                <span className="text-xs">
                  ({progressStats.nextUnlockPoints - userPoints} points needed)
                </span>
              </p>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(progressStats.unlockedTips / progressStats.totalTips) * 100}%` 
            }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {Object.entries(tips).map(([category, categoryTips]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTips.map((tip) => (
              <motion.div
                key={tip._id}
                whileHover={{ scale: tip.is_unlocked ? 1.02 : 1 }}
                className={`p-4 rounded-lg shadow-md ${
                  tip.is_unlocked ? 'bg-white cursor-pointer' : 'bg-gray-100'
                }`}
                onClick={() => handleTipClick(tip)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium flex-1">{tip.title}</h3>
                  {tip.is_unlocked ? (
                    <LockOpenIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <LockClosedIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                {!tip.is_unlocked && (
                  <p className="text-sm text-gray-600">
                    Unlock with {tip.points_needed} more points
                  </p>
                )}
                {tip.expert && (
                  <div className="flex items-center mt-2">
                    {tip.expert.avatar && (
                      <img
                        src={tip.expert.avatar.asset.url}
                        alt={tip.expert.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tip.expert.name}</p>
                      <p className="text-xs text-gray-600">{tip.expert.credentials}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {selectedTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTip(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedTip.title}</h2>
              {selectedTip.expert && (
                <div className="flex items-center mb-4">
                  {selectedTip.expert.avatar && (
                    <img
                      src={selectedTip.expert.avatar.asset.url}
                      alt={selectedTip.expert.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedTip.expert.name}</p>
                    <p className="text-sm text-gray-600">{selectedTip.expert.credentials}</p>
                  </div>
                </div>
              )}
              <div className="prose max-w-none">
                <PortableText value={selectedTip.content} />
              </div>
              <button
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => setSelectedTip(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertAdvice; 