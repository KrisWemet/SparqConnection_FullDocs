import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {currentUser?.displayName || 'User'}!</h2>
        <p className="text-gray-600 mb-4">
          This is your personal dashboard where you can track your progress and access various features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-medium mb-2">Today's Prompt</h3>
            <p className="text-sm text-gray-600">
              Share one thing you appreciate about your relationship today.
            </p>
            <button className="mt-3 text-purple-600 text-sm font-medium hover:underline">
              Answer Prompt
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium mb-2">Relationship Quiz</h3>
            <p className="text-sm text-gray-600">
              Discover your communication style with our latest quiz.
            </p>
            <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
              Take Quiz
            </button>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-medium mb-2">New Articles</h3>
            <p className="text-sm text-gray-600">
              3 new articles about building trust in relationships.
            </p>
            <button className="mt-3 text-green-600 text-sm font-medium hover:underline">
              Read Articles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 