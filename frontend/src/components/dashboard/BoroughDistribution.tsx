import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { buildingsAPI } from '../../services/api';

interface BoroughData {
  borough: string;
  count: number;
  color: string;
  bgColor: string;
}

const BoroughDistribution: React.FC = () => {
  const [boroughData, setBoroughData] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBuildings, setTotalBuildings] = useState(0);

  const boroughColors = {
    'Manhattan': { color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
    'Brooklyn': { color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
    'Queens': { color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
    'Bronx': { color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
    'Staten Island': { color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' }
  };

  useEffect(() => {
    fetchBoroughData();
  }, []);

  const fetchBoroughData = async () => {
    try {
      setLoading(true);
      const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
      const promises = boroughs.map(borough => 
        buildingsAPI.getBuildings({ borough, limit: 1, page: 1 })
      );
      
      const responses = await Promise.all(promises);
      const data = responses.map((response, index) => ({
        borough: boroughs[index],
        count: response.data.total || 0,
        color: boroughColors[boroughs[index] as keyof typeof boroughColors].color,
        bgColor: boroughColors[boroughs[index] as keyof typeof boroughColors].bgColor,
        borderColor: boroughColors[boroughs[index] as keyof typeof boroughColors].borderColor
      }));
      
      const total = data.reduce((sum, item) => sum + item.count, 0);
      setTotalBuildings(total);
      setBoroughData(data);
    } catch (err) {
      console.error('Error fetching borough data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count: number) => {
    if (totalBuildings === 0) return 0;
    return ((count / totalBuildings) * 100).toFixed(1);
  };

  const getMaxCount = () => {
    return Math.max(...boroughData.map(b => b.count));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="h-6 w-6 text-[#ff6319]" />
        <h2 className="text-xl font-bold text-[#004b87]">Borough Distribution</h2>
      </div>

      <div className="space-y-3">
        {boroughData.map((borough) => (
          <div key={borough.borough} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{borough.borough}</span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${borough.color}`}>
                  {borough.count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({getPercentage(borough.count)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
              <div
                className={`h-full rounded-full ${borough.bgColor} border-2 ${borough.borderColor} flex items-center justify-end pr-2 transition-all duration-500`}
                style={{ width: `${(borough.count / getMaxCount()) * 100}%` }}
              >
                {borough.count > 0 && (
                  <span className={`text-xs font-semibold ${borough.color}`}>
                    {borough.count}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Buildings</span>
          <span className="text-lg font-bold text-[#004b87]">
            {totalBuildings.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BoroughDistribution;