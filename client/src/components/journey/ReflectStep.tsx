import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { encrypt } from '../../utils/encryption';
import type { Journey } from '../../types/journey';
import type { User } from '../../types/user';

interface ReflectStepProps {
  journey: Journey;
  user: User;
  onSubmit: (encryptedData: { reflection: string; iv: string }) => Promise<void>;
}

export const ReflectStep: React.FC<ReflectStepProps> = ({ journey, user, onSubmit }) => {
  const [reflection, setReflection] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reflection.trim()) {
      setValidationError('Reflection is required');
      return;
    }

    if (!user.privateKey) {
      setValidationError('Missing encryption key. Please contact support.');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');

      // Encrypt reflection before sending to server
      const encryptedReflection = encrypt(reflection.trim(), user.privateKey);

      await onSubmit({
        reflection: encryptedReflection.data,
        iv: encryptedReflection.iv
      });
    } catch (err) {
      setValidationError('Failed to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tooltip
      title="Take time to write down your thoughts and experiences from the activities"
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
        <h2 className="text-2xl font-semibold mb-4">Reflect on Your Experience</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts and experiences..."
          className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          aria-label="Reflection input"
          disabled={isSubmitting}
        />
        {validationError && (
          <p className="text-red-600 mt-2">{validationError}</p>
        )}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          aria-label="Submit reflection"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reflection'}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Your reflection will be encrypted and can only be read by you and your partner.
        </p>
      </motion.div>
    </Tooltip>
  );
}; 