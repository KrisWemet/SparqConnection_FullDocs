import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import styled from '@emotion/styled';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FirestoreMetrics {
  readCount: number;
  writeCount: number;
  deleteCount: number;
  totalOperations: number;
  quotaLimit: number;
  lastUpdated: string;
}

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const WarningBanner = styled.div<{ show: boolean }>`
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  display: ${props => props.show ? 'block' : 'none'};
`;

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FirestoreMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get<{ success: boolean; data: FirestoreMetrics }>(
          '/api/admin/metrics',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
          }
        );

        if (response.data.success) {
          setMetrics(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch Firestore metrics');
        console.error('Error fetching metrics:', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getGaugeData = (value: number, limit: number) => ({
    datasets: [
      {
        data: [value, limit - value],
        backgroundColor: [
          value > limit * 0.8 ? '#dc3545' : value > limit * 0.4 ? '#ffc107' : '#28a745',
          '#e9ecef',
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
    labels: ['Used', 'Available'],
  });

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${value.toLocaleString()} operations`;
          },
        },
      },
    },
  };

  if (error) {
    return (
      <DashboardContainer>
        <div className="alert alert-danger">{error}</div>
      </DashboardContainer>
    );
  }

  if (!metrics) {
    return (
      <DashboardContainer>
        <div>Loading metrics...</div>
      </DashboardContainer>
    );
  }

  const usagePercentage = (metrics.totalOperations / metrics.quotaLimit) * 100;

  return (
    <DashboardContainer>
      <h1>Firestore Usage Dashboard</h1>
      
      <WarningBanner show={usagePercentage >= 40}>
        Warning: Firestore usage is at {usagePercentage.toFixed(1)}% of quota
      </WarningBanner>

      <MetricsGrid>
        <MetricCard>
          <h3>Total Operations</h3>
          <div style={{ height: '200px' }}>
            <Doughnut
              data={getGaugeData(metrics.totalOperations, metrics.quotaLimit)}
              options={gaugeOptions}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            {metrics.totalOperations.toLocaleString()} / {metrics.quotaLimit.toLocaleString()}
          </div>
        </MetricCard>

        <MetricCard>
          <h3>Operation Breakdown</h3>
          <div style={{ height: '200px' }}>
            <Doughnut
              data={{
                labels: ['Reads', 'Writes', 'Deletes'],
                datasets: [
                  {
                    data: [metrics.readCount, metrics.writeCount, metrics.deleteCount],
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </MetricCard>

        <MetricCard>
          <h3>Usage Statistics</h3>
          <ul>
            <li>Read Operations: {metrics.readCount.toLocaleString()}</li>
            <li>Write Operations: {metrics.writeCount.toLocaleString()}</li>
            <li>Delete Operations: {metrics.deleteCount.toLocaleString()}</li>
            <li>Last Updated: {new Date(metrics.lastUpdated).toLocaleString()}</li>
          </ul>
        </MetricCard>
      </MetricsGrid>
    </DashboardContainer>
  );
};

export default AdminDashboard; 