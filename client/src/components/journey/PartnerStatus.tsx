import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface PartnerStatusProps {
  currentDay: number;
  partnerDay: number;
  lastActivity?: {
    type: string;
    timestamp: string;
    description?: string;
  };
}

export const PartnerStatus: React.FC<PartnerStatusProps> = ({
  currentDay,
  partnerDay,
  lastActivity
}) => {
  const daysAhead = currentDay - partnerDay;
  const lastActivityText = lastActivity 
    ? formatDistanceToNow(new Date(lastActivity.timestamp), { addSuffix: true })
    : 'No recent activity';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
    >
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Partner Status
      </h3>
      <p className="text-yellow-700">
        Your partner is on Day {partnerDay}
        {daysAhead > 0 && ` (${daysAhead} ${daysAhead === 1 ? 'day' : 'days'} behind)`}
      </p>
      <p className="text-sm text-yellow-600 mt-1">
        Last activity: {lastActivityText}
        {lastActivity?.description && ` - ${lastActivity.description}`}
      </p>
    </motion.div>
  );
}; 