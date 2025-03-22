import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { encrypt } from '../utils/encryption';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: number;
  questions: QuizQuestion[];
  category: string;
}

export const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPersonalizedQuizzes();
  }, []);

  const fetchPersonalizedQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personalized-content?type=quiz`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to fetch quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, score: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleSubmitQuiz = async () => {
    const currentQuiz = quizzes[currentQuizIndex];
    if (!currentQuiz || !user) return;

    if (!user.privateKey) {
      setError('Missing encryption key. Please contact support.');
      return;
    }

    try {
      setIsSubmitting(true);
      const totalScore = Object.values(selectedAnswers).reduce((a, b) => a + b, 0);
      const maxPossibleScore = currentQuiz.questions.length * 100;
      const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

      // Store privateKey in a const to help TypeScript understand it's defined
      const privateKey = user.privateKey;

      // Encrypt the answers before sending
      const encryptedAnswers = Object.entries(selectedAnswers).map(([questionId, score]) => {
        const encryptedAnswer = encrypt(
          JSON.stringify({ questionId, score }),
          privateKey
        );
        return {
          questionId,
          encryptedData: encryptedAnswer.data,
          iv: encryptedAnswer.iv,
          score
        };
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/quizzes/submit`,
        {
          quizId: currentQuiz.id,
          answers: encryptedAnswers,
          totalScore: percentageScore
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setScore(percentageScore);

      // Reset for next quiz after 3 seconds
      setTimeout(() => {
        if (currentQuizIndex < quizzes.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
        } else {
          fetchPersonalizedQuizzes();
          setCurrentQuizIndex(0);
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setScore(null);
      }, 3000);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
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

  if (!quizzes.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No Quizzes Available</h2>
        <p className="text-gray-600">
          Check back later for personalized quizzes!
        </p>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <motion.div
        key={`${currentQuiz.id}-${currentQuestionIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{currentQuiz.title}</h2>
            <p className="text-sm text-gray-500">Topic: {currentQuiz.topic}</p>
          </div>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </span>
        </div>

        <div className="mb-8">
          <p className="text-lg mb-4">{currentQuestion.question}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(currentQuestion.id, option.score)}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  selectedAnswers[currentQuestion.id] === option.score
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                disabled={isSubmitting}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={
                Object.keys(selectedAnswers).length !== currentQuiz.questions.length ||
                isSubmitting
              }
              className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!selectedAnswers[currentQuestion.id] || isSubmitting}
              className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>

        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-primary-50 rounded-lg text-center"
          >
            <h3 className="text-xl font-bold text-primary-700">
              Quiz Complete!
            </h3>
            <p className="text-primary-600">
              Your score: {score}%
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Quizzes; 