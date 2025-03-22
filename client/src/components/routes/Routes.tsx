import React, { Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

// Lazy load components
const Dashboard = React.lazy(() => import('../../pages/Dashboard'));
const DailyLog = React.lazy(() => import('../../pages/DailyLog'));
const Journey = React.lazy(() => import('../../pages/Journey'));
const Profile = React.lazy(() => import('../../pages/Profile'));
const Login = React.lazy(() => import('../../pages/Login'));
const Register = React.lazy(() => import('../../pages/Register'));

const Routes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/daily-log" element={user ? <DailyLog /> : <Navigate to="/login" />} />
        <Route path="/journey/:journeyId" element={user ? <Journey /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes; 