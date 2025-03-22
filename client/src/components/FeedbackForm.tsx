import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from '../utils/analytics';

interface FeedbackFormProps {
  onClose?: () => void;
}

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform';

export const FeedbackForm: React.FC<FeedbackFormProps> = React.memo(({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { user } = useAuth();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      // Track feedback submission event
      await trackEvent('feedback_submitted', {
        userId: user?.id,
        category: formData.get('category'),
        rating: formData.get('rating'),
      });

      // Open Google Form in a new window
      window.open(GOOGLE_FORM_URL, '_blank');
      
      setShowThankYou(true);
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, onClose]);

  if (showThankYou) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md text-center"
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thank You!</h3>
        <p className="text-gray-600">Your feedback helps us improve Sparq Connection.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Share Your Feedback</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close feedback form"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="improvement">Improvement Suggestion</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            How satisfied are you with Sparq Connection?
          </label>
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="flex flex-col items-center">
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  required
                  className="sr-only"
                />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-purple-500 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  {value}
                </motion.div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${
            isSubmitting ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
          } transition-colors`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </motion.div>
  );
});

FeedbackForm.displayName = 'FeedbackForm';

export default FeedbackForm; 