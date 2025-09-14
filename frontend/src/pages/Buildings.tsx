import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  AlertTriangle,
  Download
} from 'lucide-react';
import { buildingsAPI, exportAPI, downloadFile } from '../services/api';
import { Building, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

type SortField = 'address' | 'borough' | 'year_built' | 'floors_above_grade' | 'elevator_count' | 'total_violations' | 'opportunity_score';
type SortOrder = 'asc' | 'desc';

const Buildings: React.FC = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState<SortField>('opportunity_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedBorough, setSelectedBorough] = useState<string>('');
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [exporting, setExporting] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchBuildings();
  }, [page, sortField, sortOrder, selectedBorough, minScore]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await buildingsAPI.getBuildings({
        page,
        limit,
        sort: sortField,
        order: sortOrder,
        borough: selectedBorough || undefined,
        minScore: minScore || undefined
      });
      
      const data = response.data as PaginatedResponse<Building>;
      setBuildings(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load buildings. Please try again.');
      console.error('Error fetching buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExporting(true);
      const response = await exportAPI.exportBuildings({
        format,
        borough: selectedBorough || undefined,
        minScore: minScore || undefined,
        limit: 1000 // Export more records than displayed
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `buildings_export_${timestamp}.${format}`;
      downloadFile(response.data, filename);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'Critical': 'bg-red-600',
      'High': 'bg-orange-600',
      'Medium': 'bg-yellow-600',
      'Low': 'bg-green-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-600';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  if (loading && buildings.length === 0) return <LoadingSpinner message="Loading buildings..." />;
  if (error && buildings.length === 0) return <ErrorMessage message={error} onRetry={fetchBuildings} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-[#004b87]" />
            <div>
              <h1 className="text-3xl font-bold text-[#004b87]">Buildings Directory</h1>
              <p className="text-gray-600 mt-1">Comprehensive list of all analyzed buildings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#ff6319]">{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Buildings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borough</label>
            <select
              value={selectedBorough}
              onChange={(e) => {
                setSelectedBorough(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
            >
              <option value="">All Boroughs</option>
              <option value="Manhattan">Manhattan</option>
              <option value="Brooklyn">Brooklyn</option>
              <option value="Queens">Queens</option>
              <option value="Bronx">Bronx</option>
              <option value="Staten Island">Staten Island</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
            <input
              type="number"
              min="0"
              max="100"
              value={minScore || ''}
              onChange={(e) => {
                setMinScore(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              placeholder="Any"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87] w-24"
            />
          </div>
          <button
            onClick={() => {
              setSelectedBorough('');
              setMinScore(undefined);
              setPage(1);
            }}
            className="mt-6 px-4 py-2 text-sm text-[#004b87] border border-[#004b87] rounded-md hover:bg-[#004b87] hover:text-white transition-colors"
          >
            Clear Filters
          </button>
          <div className="flex gap-2 mt-6 ml-auto">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
            >
              {exporting ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
            >
              {exporting ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export JSON
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Buildings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#004b87] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('address')}
                    className="flex items-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Address</span>
                    <SortIcon field="address" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('borough')}
                    className="flex items-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Borough</span>
                    <SortIcon field="borough" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('year_built')}
                    className="flex items-center justify-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Year Built</span>
                    <SortIcon field="year_built" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('floors_above_grade')}
                    className="flex items-center justify-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Floors</span>
                    <SortIcon field="floors_above_grade" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('elevator_count')}
                    className="flex items-center justify-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Elevators</span>
                    <SortIcon field="elevator_count" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_violations')}
                    className="flex items-center justify-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Violations</span>
                    <SortIcon field="total_violations" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('opportunity_score')}
                    className="flex items-center justify-center space-x-1 hover:text-[#ff6319] transition-colors"
                  >
                    <span>Score</span>
                    <SortIcon field="opportunity_score" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buildings.map((building) => (
                <tr 
                  key={building.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/building/${building.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {building.building_name || building.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          BIN: {building.bin_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{building.borough}</span>
                    <div className="text-xs text-gray-500">{building.zip_code}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{building.year_built}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Layers className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{building.floors_above_grade}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{building.elevator_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {building.total_violations || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreColor(building.opportunity_score)}`}>
                      {building.opportunity_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-block w-2 h-2 rounded-full ${getPriorityBadge(building.priority_level)}`} />
                    <span className="ml-2 text-xs text-gray-600">{building.priority_level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} buildings
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    pageNumber === page
                      ? 'bg-[#004b87] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {totalPages > 5 && <span className="text-gray-500">...</span>}
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buildings;