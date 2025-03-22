import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Sparq Connection</h1>
        <p className="text-xl mb-8">Build stronger relationships through daily prompts, quizzes, and expert advice.</p>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/register" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 