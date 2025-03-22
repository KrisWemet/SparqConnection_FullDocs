import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../app/store';
import { setDarkMode } from '../app/store';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector(state => state.app);
  
  const toggleDarkMode = () => {
    dispatch(setDarkMode(!darkMode));
  };

  return (
    <nav className="bg-purple-700 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Sparq Connection</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-purple-600"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-purple-200">Dashboard</Link>
              <Link to="/profile" className="hover:text-purple-200">Profile</Link>
              <button 
                onClick={() => logout()} 
                className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-purple-200">Login</Link>
              <Link 
                to="/register" 
                className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 