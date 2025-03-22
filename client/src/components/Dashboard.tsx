import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaBook, FaLightbulb, FaCalendarAlt, FaUserGraduate, FaCrown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { usePolling } from '../hooks/usePolling';
import type { DashboardStats, JourneyProgress } from '../types/dashboard';
import type { ActivitySummary } from '../types/activity';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  isPremium?: boolean;
  completed?: number;
  total?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  to,
  isPremium = false,
  completed,
  total
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative bg-white rounded-xl shadow-lg overflow-hidden"
  >
    <Link to={to} className="block p-6">
      <div className="flex items-start justify-between">
        <div className="text-purple-600 text-2xl">
          {icon}
        </div>
        {isPremium && (
          <div className="flex items-center text-yellow-600">
            <FaCrown className="mr-1" />
            <span className="text-sm">Premium</span>
          </div>
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      {completed !== undefined && total !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{completed} of {total} completed</span>
            <span>{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 rounded-full h-2"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  </motion.div>
);

// Memoized stat card component
const StatCard = React.memo<{
  title: string;
  value: number | string;
  description: string;
}>(({ title, value, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-lg shadow-md"
  >
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-3xl font-bold text-purple-600 my-2">{value}</p>
    <p className="text-sm text-gray-600">{description}</p>
  </motion.div>
));

// Memoized activity list component
const ActivityList = React.memo<{
  activities: ActivitySummary[];
}>(({ activities }) => (
  <div className="space-y-4">
    {activities.map((activity) => (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-4 rounded-lg shadow-md"
      >
        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
        {activity.description && (
          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-purple-600">{activity.date}</span>
          <span className="text-gray-500">{activity.duration} min</span>
        </div>
      </motion.div>
    ))}
  </div>
));

// Memoized progress chart component
const ProgressChart = React.memo<{
  progress: JourneyProgress[];
}>(({ progress }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Journey Progress</h3>
    <div className="h-64">
      {/* Add your chart implementation here */}
      {progress.map((item) => (
        <div
          key={item.journeyId}
          className="flex items-center space-x-2 mb-2"
        >
          <div
            className="h-2 bg-purple-600 rounded"
            style={{ width: `${item.completionPercentage}%` }}
          />
          <span className="text-sm text-gray-600">
            {item.title}: {item.completionPercentage}%
          </span>
        </div>
      ))}
    </div>
  </div>
));

// Memoized refresh button component
const RefreshButton = React.memo<{
  onRefresh: () => void;
  isLoading: boolean;
}>(({ onRefresh, isLoading }) => (
  <button
    onClick={onRefresh}
    disabled={isLoading}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
      isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
    } transition-colors`}
  >
    <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
    {isLoading && (
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
    )}
  </button>
));

export const Dashboard: React.FC = React.memo(() => {
  const { user } = useAuth();
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { data, loading, error, refetch } = useDashboardData(user?.id);

  // Set up polling with 60-second interval
  usePolling(refetch, 60000);

  // Memoized handlers
  const handleRefresh = useCallback(async () => {
    setIsManualRefresh(true);
    await refetch();
    setIsManualRefresh(false);
  }, [refetch]);

  // Memoized stats calculations
  const stats = useMemo(() => {
    if (!data) return null;

    return {
      totalActivities: data.activities.length,
      completedJourneys: data.progress.filter((p) => p.completionPercentage === 100).length,
      averageEngagement: Math.round(
        data.activities.reduce((acc, curr) => acc + curr.duration, 0) / data.activities.length
      ),
    };
  }, [data]);

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading dashboard data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <RefreshButton onRefresh={handleRefresh} isLoading={loading || isManualRefresh} />
      </div>

      {loading && !data ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Activities"
                value={stats.totalActivities}
                description="Activities completed across all journeys"
              />
              <StatCard
                title="Completed Journeys"
                value={stats.completedJourneys}
                description="Number of journeys completed"
              />
              <StatCard
                title="Average Engagement"
                value={`${stats.averageEngagement} min`}
                description="Average time spent per activity"
              />
            </div>
          )}

          {data && (
            <>
              <ProgressChart progress={data.progress} />
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
                <ActivityList activities={data.activities} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard; 