import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Analytics: React.FC = () => {
  const [roiData, setRoiData] = useState<any[]>([]);
  const [violationData, setViolationData] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [roiResponse, violationsResponse, scoreResponse] = await Promise.all([
        analyticsAPI.getROIAnalysis(),
        analyticsAPI.getRecentViolations(),
        analyticsAPI.getScoreDistribution()
      ]);

      setRoiData(roiResponse.data);
      setViolationData(violationsResponse.data.slice(0, 10)); // Top 10 buildings with violations
      setScoreDistribution(scoreResponse.data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    Critical: '#dc2626',
    High: '#ea580c',
    Medium: '#ca8a04',
    Low: '#16a34a'
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAnalyticsData} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-[#004b87]" />
          <div>
            <h1 className="text-3xl font-bold text-[#004b87]">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#004b87] flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>ROI Analysis by Priority Level</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Expected return on investment across different priority levels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority_level" />
                <YAxis label={{ value: 'Average ROI (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="average_roi" fill="#004b87" name="Average ROI" radius={[8, 8, 0, 0]}>
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.priority_level as keyof typeof COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ priority_level, total_value }) => `${priority_level}: ${formatCurrency(total_value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_value"
                >
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.priority_level as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {roiData.map((item) => (
            <div key={item.priority_level} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{item.priority_level}</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.priority_level as keyof typeof COLORS] }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{item.average_roi.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Avg ROI</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatCurrency(item.total_value)}
                </p>
                <p className="text-xs text-gray-500">{item.building_count} buildings</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Distribution Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#004b87] flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Opportunity Score Distribution</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Distribution of buildings across different score categories</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis label={{ value: 'Number of Buildings', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#ff6319" 
              strokeWidth={3}
              dot={{ fill: '#004b87', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
              name="Building Count"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Violations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#004b87] flex items-center space-x-2">
            <AlertCircle className="h-6 w-6" />
            <span>Buildings with Recent Violations</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Top buildings by violation count</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Borough</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {violationData.map((building: any) => (
                <tr key={building.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{building.address}</div>
                    <div className="text-xs text-gray-500">BIN: {building.bin_number}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{building.borough}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-red-600">{building.total_violations}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{building.opportunity_score.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${COLORS[building.priority_level as keyof typeof COLORS]}20`,
                        color: COLORS[building.priority_level as keyof typeof COLORS]
                      }}
                    >
                      {building.priority_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;