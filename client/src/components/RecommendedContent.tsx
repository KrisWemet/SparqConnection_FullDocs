import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface Prompt {
  _id: string;
  title: string;
  content: string;
  topic: string;
  difficulty: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: number;
}

interface PersonalizedContent {
  recommendations: {
    prompts: Prompt[];
    quizzes: Quiz[];
  };
  userInsights: {
    engagementLevel: number;
    topicPreferences: { [key: string]: number };
    suggestedTopics: string[];
  };
}

const RecommendedContent: React.FC = () => {
  const [content, setContent] = useState<PersonalizedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchPersonalizedContent();
  }, []);

  const fetchPersonalizedContent = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/personalize',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load personalized content');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        
        {/* Engagement Level */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Engagement Level</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${content.userInsights.engagementLevel * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Recommended Prompts */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Personalized Prompts</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {content.recommendations.prompts.map(prompt => (
              <motion.div
                key={prompt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 p-4 rounded-lg"
              >
                <h4 className="font-medium mb-2">{prompt.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{prompt.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {prompt.topic}
                  </span>
                  <span className="text-gray-500">
                    Difficulty: {prompt.difficulty}/100
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommended Quizzes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Suggested Quizzes</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {content.recommendations.quizzes.map(quiz => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 p-4 rounded-lg"
              >
                <h4 className="font-medium mb-2">{quiz.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {quiz.topic}
                  </span>
                  <span className="text-gray-500">
                    Difficulty: {quiz.difficulty}/100
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Topic Insights */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Topic Insights</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your Top Topics</h4>
              <div className="space-y-2">
                {Object.entries(content.userInsights.topicPreferences)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([topic, count]) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{topic}</span>
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        {count} responses
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Suggested Topics to Explore</h4>
              <div className="space-y-2">
                {content.userInsights.suggestedTopics.map(topic => (
                  <div
                    key={topic}
                    className="text-sm bg-yellow-50 text-yellow-800 px-3 py-2 rounded"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedContent; 