import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import { useAppSelector } from './app/store';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Forum from './components/Forum/Forum';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

function App() {
  // Use our Redux state
  const { darkMode } = useAppSelector(state => state.app);
  
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ErrorBoundary>
          <Layout>
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/forum" element={<Forum />} />
                </Routes>
              </main>
            </div>
          </Layout>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
