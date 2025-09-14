import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, DollarSign, Building2, BarChart3 } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { Building } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const HotOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotOpportunities();
  }, []);

  const fetchHotOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getHotOpportunities(10);
      // The backend returns { success: true, data: [...] }
      const oppsData = response.data.data || response.data || [];
      setOpportunities(Array.isArray(oppsData) ? oppsData : []);
    } catch (err) {
      setError('Failed to load hot opportunities.');
      console.error('Error fetching hot opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-red-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) return <LoadingSpinner message="Loading hot opportunities..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHotOpportunities} />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-[#ff6319]" />
            <h2 className="text-xl font-bold text-[#004b87]">Hot Opportunities</h2>
          </div>
          <span className="text-sm text-gray-500">Top 10 buildings by opportunity score</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Building
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Value
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROI
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {opportunities.map((building, index) => (
              <tr 
                key={building.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-[#004b87] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {building.building_name || `Building ${building.bin_number}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        BIN: {building.bin_number}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-900">{building.address}</div>
                      <div className="text-xs text-gray-500">
                        {building.borough}, NY {building.zip_code}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(Number(building.opportunity_score))}`}>
                    {Number(building.opportunity_score).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <BarChart3 className="h-3 w-3 inline mr-1" />
                    Score
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(building.priority_level)}`}>
                    {building.priority_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {building.estimated_project_value 
                        ? `$${(Number(building.estimated_project_value) / 1000).toFixed(0)}K`
                        : 'TBD'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {building.estimated_roi 
                      ? `${Number(building.estimated_roi).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Building2 className="h-3 w-3" />
                        <span>{building.elevator_count || 0}</span>
                      </div>
                      <span className="text-xs text-gray-400">Elevators</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span className="font-semibold">{building.total_violations || 0}</span>
                      </div>
                      <span className="text-xs text-gray-400">Violations</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotOpportunities;