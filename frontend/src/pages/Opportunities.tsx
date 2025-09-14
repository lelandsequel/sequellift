import React, { useState, useEffect } from 'react';
import { FileSearch, TrendingUp, DollarSign, Target, Calendar, Building2 } from 'lucide-react';
import { opportunitiesAPI } from '../services/api';
import { Opportunity } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter, priorityFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opportunitiesAPI.getOpportunities({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setOpportunities(response.data);
    } catch (err) {
      setError('Failed to load opportunities. Please try again.');
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await opportunitiesAPI.updateOpportunityStatus(id, newStatus);
      // Refresh the list after updating
      fetchOpportunities();
    } catch (err) {
      console.error('Error updating opportunity status:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && opportunities.length === 0) return <LoadingSpinner message="Loading opportunities..." />;
  if (error && opportunities.length === 0) return <ErrorMessage message={error} onRetry={fetchOpportunities} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSearch className="h-8 w-8 text-[#ff6319]" />
            <div>
              <h1 className="text-3xl font-bold text-[#004b87]">Opportunities</h1>
              <p className="text-gray-600 mt-1">Manage and track modernization opportunities</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#004b87]">{opportunities.length}</p>
            <p className="text-sm text-gray-500">Active Opportunities</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <button
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
            }}
            className="mt-6 px-4 py-2 text-sm text-[#004b87] border border-[#004b87] rounded-md hover:bg-[#004b87] hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-2 ${getPriorityColor(opportunity.priority_level).split(' ')[0]} rounded-t-lg`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {opportunity.opportunity_type}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {opportunity.id.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(opportunity.priority_level)}`}>
                  {opportunity.priority_level}
                </span>
              </div>

              {opportunity.building && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {opportunity.building.building_name || opportunity.building.address}
                      </p>
                      <p className="text-gray-500">{opportunity.building.borough}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Est. Value</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {opportunity.estimated_value 
                      ? `$${(opportunity.estimated_value / 1000).toFixed(0)}K`
                      : 'TBD'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">ROI</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {opportunity.estimated_roi 
                      ? `${opportunity.estimated_roi.toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Created</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {formatDate(opportunity.created_at)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                  <select
                    value={opportunity.status}
                    onChange={(e) => handleStatusUpdate(opportunity.id, e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Opportunities;