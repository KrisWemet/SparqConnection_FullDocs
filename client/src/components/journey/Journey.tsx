import React, { useState, useCallback, useMemo } from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useJourney } from '../../hooks/useJourney';
import { useAuth } from '../../hooks/useAuth';
import { encrypt } from '../../utils/encryption';
import type { User } from '../../types/user';

interface JourneyProps {
  journeyId: string;
}

// Step descriptions for tooltips
const STEP_DESCRIPTIONS = {
  begin: "Start your day with an introduction to today's theme and set your intention",
  share: "Learn about today's activities and prepare to engage with your partner",
  reflect: "Take time to write down your thoughts and experiences from the activities",
  align: "Review your progress and prepare for tomorrow's journey",
  focus: "Complete today's mindfulness activity to strengthen your connection"
} as const;

type JourneyStep = keyof typeof STEP_DESCRIPTIONS;

// Memoized step components
const BeginStepContent = React.memo<{
  currentDay: number;
  duration: number;
  onStart: () => void;
}>(({ currentDay, duration, onStart }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center p-8"
  >
    <h2 className="text-2xl font-semibold mb-4">Begin Your Journey</h2>
    <p className="text-gray-600 mb-6">Day {currentDay} of {duration}</p>
    <button
      onClick={onStart}
      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      aria-label={`Start Day ${currentDay}`}
    >
      Start Day {currentDay}
    </button>
  </motion.div>
));

const ShareStepContent = React.memo<{
  day: { title: string; content: string; activities: string[] };
  onContinue: () => void;
}>(({ day, onContinue }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-8"
  >
    <h2 className="text-2xl font-semibold mb-4">{day.title}</h2>
    <p className="text-gray-600 mb-6">{day.content}</p>
    <div className="space-y-4 mb-8">
      {day.activities.map((activity: string, index: number) => (
        <div
          key={index}
          className="bg-purple-50 p-4 rounded-lg"
        >
          {activity}
        </div>
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
));

const ReflectionStepContent = React.memo<{
  reflection: string;
  validationError: string;
  onReflectionChange: (value: string) => void;
  onSubmit: () => void;
}>(({ reflection, validationError, onReflectionChange, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-8"
  >
    <h2 className="text-2xl font-semibold mb-4">Daily Reflection</h2>
    <div className="space-y-4">
      <textarea
        value={reflection}
        onChange={(e) => onReflectionChange(e.target.value)}
        className="w-full h-32 p-4 border rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        placeholder="Share your thoughts and feelings about today's activities..."
      />
      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}
      <button
        onClick={onSubmit}
        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Submit Reflection
      </button>
    </div>
  </motion.div>
));

export const Journey: React.FC<JourneyProps> = React.memo(({ journeyId }) => {
  const { journey, loading, error } = useJourney(journeyId);
  const [currentStep, setCurrentStep] = useState<JourneyStep>('begin');
  const [reflection, setReflection] = useState('');
  const [validationError, setValidationError] = useState('');
  const { user } = useAuth();

  // Memoized handlers
  const handleStartDay = useCallback(() => {
    setCurrentStep('share');
  }, []);

  const handleContinueToReflection = useCallback(() => {
    setCurrentStep('reflect');
  }, []);

  const handleReflectionChange = useCallback((value: string) => {
    setReflection(value);
    if (validationError) setValidationError('');
  }, [validationError]);

  const handleSubmitReflection = useCallback(async () => {
    if (!reflection.trim()) {
      setValidationError('Reflection is required');
      return;
    }

    if (!user) {
      setValidationError('You must be logged in to submit a reflection');
      return;
    }

    if (!user.privateKey) {
      setValidationError('Missing encryption key. Please contact support.');
      return;
    }

    try {
      const encryptedReflection = encrypt(reflection.trim(), user.privateKey);
      // TODO: Implement API call to save reflection
      setCurrentStep('align');
      setValidationError('');
    } catch (err) {
      setValidationError('Failed to save reflection. Please try again.');
    }
  }, [reflection, user]);

  const handleStartFocus = useCallback(() => {
    setCurrentStep('focus');
  }, []);

  // Memoized step content
  const stepContent = useMemo(() => {
    if (!journey) return null;

    switch (currentStep) {
      case 'begin':
        return (
          <Tooltip title={STEP_DESCRIPTIONS.begin} placement="top" arrow enterDelay={500}>
            <BeginStepContent
              currentDay={journey.progress.currentDay}
              duration={journey.duration}
              onStart={handleStartDay}
            />
          </Tooltip>
        );

      case 'share':
        return (
          <Tooltip title={STEP_DESCRIPTIONS.share} placement="top" arrow enterDelay={500}>
            <ShareStepContent
              day={journey.days[journey.progress.currentDay - 1]}
              onContinue={handleContinueToReflection}
            />
          </Tooltip>
        );

      case 'reflect':
        return (
          <Tooltip title={STEP_DESCRIPTIONS.reflect} placement="top" arrow enterDelay={500}>
            <ReflectionStepContent
              reflection={reflection}
              validationError={validationError}
              onReflectionChange={handleReflectionChange}
              onSubmit={handleSubmitReflection}
            />
          </Tooltip>
        );

      case 'align':
        return (
          <Tooltip title={STEP_DESCRIPTIONS.align} placement="top" arrow enterDelay={500}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-8"
            >
              <h2 className="text-2xl font-semibold mb-4">Day {journey.progress.currentDay} Complete!</h2>
              <p className="text-gray-600 mb-6">
                Great job! You've completed today's journey activities.
              </p>
              <div className="mt-8">
                <button
                  onClick={handleStartFocus}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  aria-label="Start daily focus activity"
                >
                  Start Daily Focus Activity
                </button>
              </div>
            </motion.div>
          </Tooltip>
        );

      case 'focus':
        return (
          <Tooltip title={STEP_DESCRIPTIONS.focus} placement="top" arrow enterDelay={500}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8"
            >
              <h2 className="text-2xl font-semibold mb-4">Daily Focus Activity</h2>
              <p className="text-gray-600 mb-6">
                Take 5 minutes to practice mindfulness together. Focus on your breathing and your connection.
              </p>
              {/* Add mindfulness timer or activity component here */}
            </motion.div>
          </Tooltip>
        );
    }
  }, [
    currentStep,
    journey,
    reflection,
    validationError,
    handleStartDay,
    handleContinueToReflection,
    handleReflectionChange,
    handleSubmitReflection,
    handleStartFocus,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

  if (!journey) {
    return (
      <div className="text-center text-gray-500 p-4">
        Journey not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{journey.title}</h1>
        <p className="text-gray-600 mb-8">{journey.description}</p>
        {stepContent}
      </div>
    </div>
  );
});

Journey.displayName = 'Journey';

export default Journey; 