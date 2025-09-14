import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { ScoreDistribution } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ScoreDistributionChart: React.FC = () => {
  const [data, setData] = useState<ScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScoreDistribution();
  }, []);

  const fetchScoreDistribution = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getScoreDistribution();
      // The backend returns { success: true, data: [...] }
      const distData = response.data.data || response.data || [];
      setData(Array.isArray(distData) ? distData : []);
    } catch (err) {
      setError('Failed to load score distribution.');
      console.error('Error fetching score distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (category: string) => {
    switch (category) {
      case 'Critical':
        return '#dc2626'; // red-600
      case 'High':
        return '#ea580c'; // orange-600
      case 'Medium':
        return '#ca8a04'; // yellow-600
      case 'Low':
        return '#16a34a'; // green-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">Count: {data.count}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner message="Loading score distribution..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchScoreDistribution} />;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <BarChart3 className="h-6 w-6 text-[#004b87]" />
        <h2 className="text-xl font-bold text-[#004b87]">Score Distribution</h2>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="category" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Number of Buildings', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item) => {
          const total = data.reduce((sum, d) => sum + d.count, 0);
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getBarColor(item.category) }}
                />
                <span className="text-gray-600">{item.category}</span>
              </div>
              <span className="font-semibold text-gray-900">
                {percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreDistributionChart;