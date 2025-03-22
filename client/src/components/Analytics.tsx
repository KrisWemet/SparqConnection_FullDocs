import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import HeatMap from 'react-heatmap-grid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Analytics {
  points: {
    total: number;
    history: Array<{
      date: string;
      points: number;
    }>;
  };
  streaks: {
    current: number;
    longest: number;
    history: Array<{
      date: string;
      streak: number;
    }>;
  };
  badges: Array<{
    name: string;
    description: string;
    earned_at: string;
  }>;
  quiz_scores: {
    communication: number;
    empathy: number;
    conflict_resolution: number;
  };
  total_responses: number;
  response_streak: number;
  mood_trends: {
    average: number;
    weekly_trend: number[];
    improvement_areas: string[];
  };
  responseHeatmap: number[][];
  badgeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  engagementMetrics: {
    totalResponses: number;
    averageResponsesPerDay: number;
    totalBadges: number;
    badgeCompletionRate: number;
  };
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/analytics`);
      setAnalytics(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const pointsChartData = {
    labels: analytics?.points.history.map(entry => entry.date) || [],
    datasets: [
      {
        label: 'Points Earned',
        data: analytics?.points.history.map(entry => entry.points) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const streakChartData = {
    labels: analytics?.streaks.history.map(entry => entry.date) || [],
    datasets: [
      {
        label: 'Daily Streak',
        data: analytics?.streaks.history.map(entry => entry.streak) || [],
        backgroundColor: 'rgb(59, 130, 246)',
        borderRadius: 4
      }
    ]
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const pieChartData = {
    labels: analytics?.badgeDistribution.map(b => b.type) || [],
    datasets: [
      {
        data: analytics?.badgeDistribution.map(b => b.percentage) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `${value.toFixed(1)}%`;
          }
        }
      }
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

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.points.total}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Streak</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.streaks.current} days
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Longest Streak</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.streaks.longest} days
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.total_responses}
          </div>
        </div>
      </motion.div>

      {/* Points History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Points History</h3>
        <div className="h-64">
          <Line
            data={pointsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Streak History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Streak History</h3>
        <div className="h-64">
          <Bar
            data={streakChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Earned Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.badges.map((badge, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="font-semibold text-gray-900">{badge.name}</h4>
              <p className="text-sm text-gray-600">{badge.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quiz Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Relationship Skills</h3>
        <div className="space-y-4">
          {Object.entries(analytics.quiz_scores).map(([skill, score]) => (
            <div key={skill}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {skill.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">{score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mood Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Mood Trend</h3>
        <div className="h-40 flex items-end justify-between space-x-2">
          {analytics.mood_trends.weekly_trend.map((mood, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-200 rounded-t"
                style={{ height: `${(mood / 5) * 100}%` }}
              />
              <span className="text-xs text-gray-600 mt-1">Day {index + 1}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Engagement Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.engagementMetrics.totalResponses}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Average</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.engagementMetrics.averageResponsesPerDay.toFixed(1)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Badges</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.engagementMetrics.totalBadges}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Badge Completion</h3>
          <div className="text-3xl font-bold text-primary-600">
            {analytics.engagementMetrics.badgeCompletionRate.toFixed(1)}%
          </div>
        </div>
      </motion.div>

      {/* Response Time Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Response Time Distribution</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <HeatMap
              xLabels={hours}
              yLabels={daysOfWeek}
              data={analytics.responseHeatmap}
              cellStyle={(background, value, min, max) => ({
                background: `rgb(66, 86, 244, ${value / max})`,
                fontSize: '11px',
                color: value > (max - min) / 2 ? '#fff' : '#000'
              })}
              cellRender={value => value > 0 ? value : ''}
              title={(value) => `${value} responses`}
            />
          </div>
        </div>
      </motion.div>

      {/* Badge Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Badge Distribution</h3>
        <div className="h-[400px]">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics; 