import React from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import type { Journey, JourneyProgress } from '../../types/journey';
import { PartnerStatus } from './PartnerStatus';

interface BeginStepProps {
  journey: Journey;
  onStart: () => void;
  partnerProgress?: JourneyProgress;
}

export const BeginStep: React.FC<BeginStepProps> = ({ journey, onStart, partnerProgress }) => {
  const isPartnerBehind = partnerProgress && partnerProgress.currentDay < journey.progress.currentDay;
  const canProceed = !isPartnerBehind || journey.progress.currentDay <= 1;

  return (
    <Tooltip
      title="Start your day with an introduction to today's theme and set your intention"
      placement="top"
      arrow
      enterDelay={500}
      className="w-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Begin Your Journey</h2>
        <p className="text-gray-600 mb-6">Day {journey.progress.currentDay} of {journey.duration}</p>
        
        {isPartnerBehind && partnerProgress && (
          <PartnerStatus
            currentDay={journey.progress.currentDay}
            partnerDay={partnerProgress.currentDay}
            lastActivity={partnerProgress.lastActivity}
          />
        )}

        <button
          onClick={onStart}
          className={`bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors ${
            canProceed 
              ? 'hover:bg-purple-700' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!canProceed}
          aria-label={`Start Day ${journey.progress.currentDay}`}
        >
          {canProceed 
            ? `Start Day ${journey.progress.currentDay}`
            : 'Waiting for Partner'
          }
        </button>

        {!canProceed && (
          <p className="mt-4 text-sm text-gray-500">
            Your partner needs to complete Day {partnerProgress?.currentDay} before you can proceed.
            Send them an encouraging message!
          </p>
        )}
      </motion.div>
    </Tooltip>
  );
}; 