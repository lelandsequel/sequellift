import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Filter,
  Download,
  FileText,
  AlertCircle,
  Shield,
  Activity,
  ChevronRight,
  Info,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface Violation {
  id: string;
  violation_number: string;
  violation_date: string;
  violation_code: string;
  violation_category: string;
  description: string;
  device_number?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Resolved' | 'Pending' | 'Under Review';
  compliance_deadline: string;
  remediation_cost?: number;
  disposition_date?: string;
  disposition_comments?: string;
  inspector_name?: string;
  hazard_class?: string;
}

interface ViolationStats {
  total: number;
  active: number;
  resolved: number;
  pending: number;
  critical: number;
  averageCost: number;
  complianceRate: number;
}

interface ViolationsTabProps {
  buildingId: string;
}

const ViolationsTab: React.FC<ViolationsTabProps> = ({ buildingId }) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [violationStats, setViolationStats] = useState<ViolationStats | null>(null);

  useEffect(() => {
    // Simulate fetching violations data
    setTimeout(() => {
      const mockViolations: Violation[] = [
        {
          id: '1',
          violation_number: 'VIO-2024-001',
          violation_date: '2024-03-15',
          violation_code: '3.10.8',
          violation_category: 'Safety',
          description: 'Emergency brake system requires immediate recalibration',
          device_number: 'EL-003',
          severity: 'Critical',
          status: 'Active',
          compliance_deadline: '2024-04-15',
          remediation_cost: 8500,
          inspector_name: 'J. Martinez',
          hazard_class: 'A'
        },
        {
          id: '2',
          violation_number: 'VIO-2024-002',
          violation_date: '2024-02-28',
          violation_code: '2.15.3',
          violation_category: 'Maintenance',
          description: 'Annual inspection documentation incomplete',
          severity: 'Medium',
          status: 'Pending',
          compliance_deadline: '2024-05-01',
          remediation_cost: 1500,
          inspector_name: 'S. Johnson'
        },
        {
          id: '3',
          violation_number: 'VIO-2024-003',
          violation_date: '2024-02-10',
          violation_code: '4.12.1',
          violation_category: 'Compliance',
          description: 'Elevator capacity signage not properly displayed',
          device_number: 'EL-001',
          severity: 'Low',
          status: 'Resolved',
          compliance_deadline: '2024-03-10',
          remediation_cost: 500,
          disposition_date: '2024-03-05',
          disposition_comments: 'New signage installed and verified',
          inspector_name: 'M. Chen'
        },
        {
          id: '4',
          violation_number: 'VIO-2024-004',
          violation_date: '2024-01-20',
          violation_code: '5.8.2',
          violation_category: 'Safety',
          description: 'Door sensor malfunction detected during inspection',
          device_number: 'EL-002',
          severity: 'High',
          status: 'Active',
          compliance_deadline: '2024-04-01',
          remediation_cost: 4200,
          inspector_name: 'R. Thompson',
          hazard_class: 'B'
        },
        {
          id: '5',
          violation_number: 'VIO-2023-015',
          violation_date: '2023-12-15',
          violation_code: '3.5.7',
          violation_category: 'Equipment',
          description: 'Machine room ventilation below required standards',
          severity: 'Medium',
          status: 'Under Review',
          compliance_deadline: '2024-03-30',
          remediation_cost: 3000,
          inspector_name: 'L. Davis'
        },
        {
          id: '6',
          violation_number: 'VIO-2023-014',
          violation_date: '2023-11-10',
          violation_code: '6.2.4',
          violation_category: 'Documentation',
          description: 'Maintenance logs not properly maintained',
          severity: 'Low',
          status: 'Resolved',
          compliance_deadline: '2024-01-10',
          remediation_cost: 800,
          disposition_date: '2024-01-05',
          disposition_comments: 'Digital logging system implemented',
          inspector_name: 'K. Wilson'
        }
      ];

      const stats: ViolationStats = {
        total: mockViolations.length,
        active: mockViolations.filter(v => v.status === 'Active').length,
        resolved: mockViolations.filter(v => v.status === 'Resolved').length,
        pending: mockViolations.filter(v => v.status === 'Pending').length,
        critical: mockViolations.filter(v => v.severity === 'Critical').length,
        averageCost: mockViolations.reduce((sum, v) => sum + (v.remediation_cost || 0), 0) / mockViolations.length,
        complianceRate: (mockViolations.filter(v => v.status === 'Resolved').length / mockViolations.length) * 100
      };

      setViolations(mockViolations);
      setViolationStats(stats);
      setLoading(false);
    }, 500);
  }, [buildingId]);

  const getSeverityBadge = (severity: string) => {
    const badges = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'High': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'Low': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    };
    return badges[severity as keyof typeof badges] || badges.Low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Under Review': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter violations
  const filteredViolations = violations.filter(v => {
    if (filterSeverity !== 'all' && v.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (filterCategory !== 'all' && v.violation_category !== filterCategory) return false;
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(violations.map(v => v.violation_category))];

  // Calculate violation trends (mock data for chart)
  const violationTrends = [
    { month: 'Aug 2023', count: 2 },
    { month: 'Sep 2023', count: 3 },
    { month: 'Oct 2023', count: 1 },
    { month: 'Nov 2023', count: 4 },
    { month: 'Dec 2023', count: 2 },
    { month: 'Jan 2024', count: 3 },
    { month: 'Feb 2024', count: 2 },
    { month: 'Mar 2024', count: 1 }
  ];

  // Category breakdown for pie chart
  const categoryBreakdown = categories.map(cat => ({
    category: cat,
    count: violations.filter(v => v.violation_category === cat).length,
    percentage: (violations.filter(v => v.violation_category === cat).length / violations.length) * 100
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004b87] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading violations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {violationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Active Violations</p>
                <p className="text-2xl font-bold text-red-900">{violationStats.active}</p>
                <p className="text-xs text-red-600 mt-1">Requires action</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{violationStats.pending}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting resolution</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">{violationStats.resolved}</p>
                <p className="text-xs text-green-600 mt-1">
                  {violationStats.complianceRate.toFixed(1)}% compliance
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Est. Cost</p>
                <p className="text-xl font-bold text-orange-900">
                  {formatCurrency(violations.reduce((sum, v) => sum + (v.remediation_cost || 0), 0))}
                </p>
                <p className="text-xs text-orange-600 mt-1">Total remediation</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setFilterSeverity('all');
              setFilterStatus('all');
              setFilterCategory('all');
            }}
            className="px-3 py-1 text-sm text-[#004b87] border border-[#004b87] rounded-md hover:bg-[#004b87] hover:text-white transition-colors"
          >
            Clear Filters
          </button>
          <button className="ml-auto px-3 py-1 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span className="text-sm">Export Report</span>
          </button>
        </div>
      </div>

      {/* Active Violations List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 bg-[#004b87] text-white">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Violation Details
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredViolations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No violations found matching the selected filters</p>
            </div>
          ) : (
            filteredViolations.map((violation) => {
              const severityBadge = getSeverityBadge(violation.severity);
              const daysUntilDeadline = calculateDaysUntilDeadline(violation.compliance_deadline);
              const isExpanded = selectedViolation === violation.id;
              
              return (
                <div key={violation.id} className="hover:bg-gray-50 transition-colors">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedViolation(isExpanded ? null : violation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(violation.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {violation.violation_number}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityBadge.bg} ${severityBadge.text} ${severityBadge.border}`}>
                                {violation.severity}
                              </span>
                              <span className="text-sm text-gray-500">
                                Code: {violation.violation_code}
                              </span>
                              {violation.device_number && (
                                <span className="text-sm text-blue-600">
                                  Device: {violation.device_number}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-900">
                              {violation.description}
                            </p>
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Issued: {violation.violation_date}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>Category: {violation.violation_category}</span>
                              </span>
                              {violation.inspector_name && (
                                <span className="flex items-center space-x-1">
                                  <FileText className="h-3 w-3" />
                                  <span>Inspector: {violation.inspector_name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-sm font-semibold ${
                          daysUntilDeadline < 0 ? 'text-red-600' :
                          daysUntilDeadline < 30 ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {violation.status === 'Resolved' ? (
                            <span className="text-green-600">Resolved</span>
                          ) : daysUntilDeadline < 0 ? (
                            `${Math.abs(daysUntilDeadline)} days overdue`
                          ) : (
                            `${daysUntilDeadline} days remaining`
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Due: {violation.compliance_deadline}
                        </div>
                        {violation.remediation_cost && (
                          <div className="text-sm font-medium text-[#ff6319] mt-2">
                            {formatCurrency(violation.remediation_cost)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {violation.hazard_class && (
                            <div>
                              <p className="text-gray-600">Hazard Class</p>
                              <p className="font-medium">Class {violation.hazard_class}</p>
                            </div>
                          )}
                          {violation.disposition_date && (
                            <div>
                              <p className="text-gray-600">Resolution Date</p>
                              <p className="font-medium">{violation.disposition_date}</p>
                            </div>
                          )}
                          {violation.disposition_comments && (
                            <div className="md:col-span-3">
                              <p className="text-gray-600">Resolution Comments</p>
                              <p className="font-medium">{violation.disposition_comments}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button className="px-3 py-1 text-sm bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors">
                            View Documents
                          </button>
                          <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                            Add Note
                          </button>
                          <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                            Contact Inspector
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Violation Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation History Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Violation History (Last 8 Months)
          </h3>
          <div className="space-y-3">
            {violationTrends.map((month, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600 w-20">{month.month}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white ${
                        month.count >= 4 ? 'bg-red-500' :
                        month.count >= 3 ? 'bg-orange-500' :
                        month.count >= 2 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(month.count / 5) * 100}%` }}
                    >
                      {month.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average per month</span>
              <span className="font-semibold">
                {(violationTrends.reduce((sum, m) => sum + m.count, 0) / violationTrends.length).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Trend</span>
              <span className="font-semibold text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Improving
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Violation Categories
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, index) => {
              const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
              const color = colors[index % colors.length];
              
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">
                      {cat.count} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-300`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Most Common</p>
              <p className="text-sm font-semibold text-gray-900">
                {categoryBreakdown.length > 0 ? categoryBreakdown.sort((a, b) => b.count - a.count)[0].category : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Critical Violations</p>
              <p className="text-sm font-semibold text-red-600">
                {violations.filter(v => v.severity === 'Critical').length} active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Status Summary */}
      <div className="bg-gradient-to-r from-[#004b87] to-[#003a6c] rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Compliance Status Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-white text-opacity-80">Overall Compliance</p>
            <p className="text-2xl font-bold">{violationStats?.complianceRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-white text-opacity-80">Days Since Last Violation</p>
            <p className="text-2xl font-bold">
              {violations.length > 0 
                ? Math.floor((new Date().getTime() - new Date(violations[0].violation_date).getTime()) / (1000 * 60 * 60 * 24))
                : 0}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-white text-opacity-80">Resolution Time (Avg)</p>
            <p className="text-2xl font-bold">12 days</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-white text-opacity-80">Compliance Risk</p>
            <p className="text-2xl font-bold text-yellow-300">Medium</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationsTab;