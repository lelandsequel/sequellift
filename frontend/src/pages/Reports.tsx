import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, Clock, TrendingUp, AlertCircle, Map, DollarSign } from 'lucide-react';
import { analyticsAPI, exportAPI, downloadFile } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters?: any;
  fields?: string[];
}

interface ExportHistory {
  id: string;
  reportType: string;
  format: string;
  timestamp: string;
  recordCount: number;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    borough: '',
    minScore: 0,
    maxScore: 100,
    priority: '',
    includeRelated: false
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>('');

  // Report types
  const reportTypes: ReportTemplate[] = [
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level overview of opportunities and key metrics',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'opportunity_pipeline',
      name: 'Opportunity Pipeline',
      description: 'Complete pipeline report with scoring and prioritization',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'territory_analysis',
      name: 'Territory Analysis',
      description: 'Geographic breakdown of opportunities by borough',
      icon: <Map className="w-5 h-5" />
    },
    {
      id: 'violation_compliance',
      name: 'Violation Compliance',
      description: 'Buildings with violations requiring immediate attention',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: 'roi_analysis',
      name: 'ROI Analysis',
      description: 'Project value analysis and revenue potential',
      icon: <DollarSign className="w-5 h-5" />
    }
  ];

  // Export templates
  const exportTemplates: ReportTemplate[] = [
    {
      id: 'hot_opportunities',
      name: 'Hot Opportunities Export',
      description: 'Top scoring buildings ready for modernization',
      icon: <TrendingUp className="w-5 h-5 text-red-500" />,
      filters: { minScore: 70, priority: 'high' }
    },
    {
      id: 'quarterly_pipeline',
      name: 'Quarterly Pipeline Report',
      description: 'All opportunities organized by priority',
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      filters: { period: 'quarter' }
    },
    {
      id: 'violation_alert',
      name: 'Violation Alert Export',
      description: 'Buildings with critical compliance issues',
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      filters: { hasCriticalViolations: true }
    },
    {
      id: 'territory_assignment',
      name: 'Territory Assignment Export',
      description: 'Buildings organized by geographic area',
      icon: <Map className="w-5 h-5 text-green-500" />,
      filters: { groupBy: 'borough' }
    }
  ];

  useEffect(() => {
    // Load templates and export history
    loadTemplates();
    loadExportHistory();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await exportAPI.getExportTemplates();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadExportHistory = () => {
    // Simulated export history
    const history: ExportHistory[] = [
      {
        id: '1',
        reportType: 'Hot Opportunities',
        format: 'csv',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recordCount: 47,
        status: 'completed'
      },
      {
        id: '2',
        reportType: 'Executive Summary',
        format: 'pdf',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        recordCount: 1,
        status: 'completed'
      },
      {
        id: '3',
        reportType: 'Territory Analysis',
        format: 'json',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        recordCount: 250,
        status: 'completed'
      }
    ];
    setExportHistory(history);
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        format: exportFormat,
        reportType: selectedReport,
        period: `${dateRange.start}_to_${dateRange.end}`,
        borough: filters.borough || undefined,
        includeCharts: false
      };

      let response;
      const endpoint = getEndpointForReport(selectedReport);
      
      if (endpoint === 'report') {
        response = await exportAPI.generateReport(payload);
      } else if (endpoint === 'buildings') {
        response = await exportAPI.exportBuildings({
          ...filters,
          format: exportFormat
        });
      } else if (endpoint === 'opportunities') {
        response = await exportAPI.exportOpportunities({
          ...filters,
          format: exportFormat
        });
      } else if (endpoint === 'violations') {
        response = await exportAPI.exportViolations({
          ...filters,
          format: exportFormat
        });
      } else {
        throw new Error('Unknown report type');
      }

      // Handle file download
      const filename = `${selectedReport}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      downloadFile(response.data, filename);

      // Add to history
      const newHistory: ExportHistory = {
        id: Date.now().toString(),
        reportType: reportTypes.find(r => r.id === selectedReport)?.name || selectedReport,
        format: exportFormat,
        timestamp: new Date().toISOString(),
        recordCount: previewData.length || 0,
        status: 'completed'
      };
      setExportHistory([newHistory, ...exportHistory]);

      // Show success message
      setError(null);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEndpointForReport = (reportType: string) => {
    switch (reportType) {
      case 'executive_summary':
      case 'territory_analysis':
      case 'violation_compliance':
      case 'roi_analysis':
      case 'opportunity_pipeline':
        return 'report';
      default:
        return 'buildings';
    }
  };

  const handleTemplateExport = async (templateId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await exportAPI.applyExportTemplate(templateId, exportFormat);

      // Handle file download
      const filename = `${templateId}_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      downloadFile(response.data, filename);

      // Add to history
      const template = exportTemplates.find(t => t.id === templateId);
      const newHistory: ExportHistory = {
        id: Date.now().toString(),
        reportType: template?.name || templateId,
        format: exportFormat,
        timestamp: new Date().toISOString(),
        recordCount: 0,
        status: 'completed'
      };
      setExportHistory([newHistory, ...exportHistory]);
    } catch (err) {
      setError('Failed to apply template. Please try again.');
      console.error('Template export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedReport) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      // Fetch preview data based on selected report
      const response = await analyticsAPI.getHotOpportunities(5);
      setPreviewData(response.data.opportunities || []);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="mt-2 text-gray-600">Generate comprehensive reports and export data for analysis</p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{report.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Filter className="inline-block w-5 h-5 mr-2" />
              Filters & Options
            </h2>
            <div className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Borough Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borough</label>
                <select
                  value={filters.borough}
                  onChange={(e) => setFilters({ ...filters, borough: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Boroughs</option>
                  <option value="Manhattan">Manhattan</option>
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Queens">Queens</option>
                  <option value="Bronx">Bronx</option>
                  <option value="Staten Island">Staten Island</option>
                </select>
              </div>

              {/* Score Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters({ ...filters, maxScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Include Related Data */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeRelated"
                  checked={filters.includeRelated}
                  onChange={(e) => setFilters({ ...filters, includeRelated: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeRelated" className="ml-2 text-sm text-gray-700">
                  Include related data (elevators, violations)
                </label>
              </div>
            </div>
          </div>

          {/* Export Format & Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h2>
            <div className="flex space-x-4 mb-6">
              {(['csv', 'json', 'pdf'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    exportFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePreview}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading || !selectedReport}
              >
                Preview Data
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading || !selectedReport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Export Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exportTemplates.map(template => (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {template.icon}
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    </div>
                    <button
                      onClick={() => handleTemplateExport(template.id)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Clock className="inline-block w-5 h-5 mr-2" />
              Export History
            </h2>
            <div className="space-y-3">
              {exportHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No exports yet</p>
              ) : (
                exportHistory.map(history => (
                  <div
                    key={history.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{history.reportType}</h4>
                      {getStatusBadge(history.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Format: {history.format.toUpperCase()}</p>
                      <p>Records: {history.recordCount.toLocaleString()}</p>
                      <p>{formatTimestamp(history.timestamp)}</p>
                    </div>
                    {history.status === 'completed' && (
                      <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Re-export
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Export Analytics */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Analytics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Exports</span>
                  <span className="font-medium">{exportHistory.length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Most Popular Format</span>
                  <span className="font-medium">CSV</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Top Report Type</span>
                  <span className="font-medium">Hot Opportunities</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Export</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
              <p className="text-sm text-gray-500">Showing first 5 records</p>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              {previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).slice(0, 5).map(key => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).slice(0, 5).map((value: any, i) => (
                            <td key={i} className="px-4 py-2 text-sm text-gray-900">
                              {value?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No data to preview</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;