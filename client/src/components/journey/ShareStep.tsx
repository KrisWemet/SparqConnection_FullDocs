import React from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import type { Journey } from '../../types/journey';

interface ShareStepProps {
  journey: Journey;
  onContinue: () => void;
}

export const ShareStep: React.FC<ShareStepProps> = ({ journey, onContinue }) => {
  const currentDayIndex = journey.progress.currentDay - 1;
  const currentDay = journey.days[currentDayIndex];

  return (
    <Tooltip
      title="Learn about today's activities and prepare to engage with your partner"
      placement="top"
      arrow
      enterDelay={500}
      className="w-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {currentDay.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {currentDay.content}
        </p>
        <div className="space-y-4 mb-8">
          {currentDay.activities.map((activity: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-purple-50 p-4 rounded-lg"
            >
              {activity}
            </motion.div>
          ))}
        </div>
        <button
          onClick={onContinue}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          aria-label="Continue to reflection step"
        >
          Continue to Reflection
        </button>
      </motion.div>
    </Tooltip>
  );
}; 