import React from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import type { Journey } from '../../types/journey';
import { PartnerStatus } from './PartnerStatus';

interface AlignStepProps {
  journey: Journey;
  onStartFocus: () => void;
}

export const AlignStep: React.FC<AlignStepProps> = ({ journey, onStartFocus }) => {
  const isPartnerSynced = journey.progress.partnerSyncStatus === 'synced';
  const waitingForPartner = journey.progress.partnerSyncStatus === 'waiting';

  return (
    <Tooltip
      title="Review your progress and prepare for tomorrow's journey"
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
        <h2 className="text-2xl font-semibold mb-4">
          Day {journey.progress.currentDay} Complete!
        </h2>
        <p className="text-gray-600 mb-6">
          Great job! You've completed today's journey activities.
        </p>

        {journey.partnerProgress && (
          <PartnerStatus
            currentDay={journey.progress.currentDay}
            partnerDay={journey.partnerProgress.currentDay}
            lastActivity={journey.partnerProgress.lastActivity}
          />
        )}

        {waitingForPartner ? (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              Waiting for your partner to complete their reflection...
            </p>
            <p className="text-sm text-blue-600 mt-2">
              You'll be notified when they're ready for the focus activity.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <Tooltip
              title="Complete today's mindfulness activity together"
              placement="bottom"
              arrow
              enterDelay={500}
            >
              <button
                onClick={onStartFocus}
                className={`bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors ${
                  isPartnerSynced ? 'hover:bg-purple-700' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isPartnerSynced}
                aria-label="Start daily focus activity"
              >
                {isPartnerSynced ? 'Start Daily Focus Activity' : 'Waiting for Partner'}
              </button>
            </Tooltip>
          </div>
        )}

        {!isPartnerSynced && !waitingForPartner && (
          <p className="mt-4 text-sm text-gray-500">
            Your partner needs to complete their reflection before you can start the focus activity together.
          </p>
        )}
      </motion.div>
    </Tooltip>
  );
}; 