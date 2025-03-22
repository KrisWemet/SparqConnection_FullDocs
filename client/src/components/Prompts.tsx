import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface Prompt {
  id: string;
  title: string;
  content: string;
  topic: string;
  difficulty: number;
  category: string;
}

export const Prompts: React.FC = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPersonalizedPrompts();
  }, []);

  const fetchPersonalizedPrompts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personalized-content?type=prompt`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      if (response.data.success) {
        setPrompts(response.data.data);
      } else {
        setError('Failed to fetch prompts');
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to fetch prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) return;

    try {
      setIsSubmitting(true);
      const currentPrompt = prompts[currentPromptIndex];

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/prompts/response`,
        {
          promptId: currentPrompt.id,
          response: response.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      // Move to next prompt or fetch new ones if at the end
      if (currentPromptIndex < prompts.length - 1) {
        setCurrentPromptIndex(prev => prev + 1);
      } else {
        await fetchPersonalizedPrompts();
        setCurrentPromptIndex(0);
      }

      setResponse('');
      setError(null);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response');
    } finally {
      setIsSubmitting(false);
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

  if (!prompts.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No Prompts Available</h2>
        <p className="text-gray-600">
          Complete some quizzes and check back later for personalized prompts!
        </p>
      </div>
    );
  }

  const currentPrompt = prompts[currentPromptIndex];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <motion.div
        key={currentPrompt.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Topic: {currentPrompt.topic}
          </span>
          <span className="text-sm text-gray-500">
            {currentPromptIndex + 1} of {prompts.length}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-4">{currentPrompt.title}</h2>
        <p className="text-lg mb-6">{currentPrompt.content}</p>

        <div className="space-y-4">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isSubmitting}
          />

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                if (currentPromptIndex > 0) {
                  setCurrentPromptIndex(prev => prev - 1);
                  setResponse('');
                }
              }}
              disabled={currentPromptIndex === 0 || isSubmitting}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={handleSubmitResponse}
              disabled={!response.trim() || isSubmitting}
              className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Prompts; 