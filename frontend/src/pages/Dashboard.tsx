import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Target,
  Download
} from 'lucide-react';
import { analyticsAPI, exportAPI, downloadFile } from '../services/api';
import { DashboardStatistics } from '../types';
import StatCard from '../components/dashboard/StatCard';
import HotOpportunities from '../components/dashboard/HotOpportunities';
import ScoreDistributionChart from '../components/dashboard/ScoreDistributionChart';
import BoroughDistribution from '../components/dashboard/BoroughDistribution';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getStatistics();
      // The backend returns { success: true, data: {...} }
      const statsData = response.data.data || response.data;
      
      // Ensure all required fields have default values
      setStatistics({
        totalBuildings: statsData.total_buildings || 0,
        criticalOpportunities: statsData.critical_opportunities || 0,
        averageScore: statsData.average_opportunity_score || 0,
        totalViolations: statsData.total_violations || 0,
        highPriorityCount: statsData.high_priority_count || 0,
        totalEstimatedValue: statsData.total_estimated_value || 0,
        boroughDistribution: statsData.borough_distribution || {},
        scoreDistribution: statsData.score_distribution || [],
        violationTrend: statsData.violation_trend || []
      });
    } catch (err) {
      setError('Failed to load dashboard statistics. Please try again.');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStatistics} />;
  if (!statistics) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#004b87]">
              NYC Elevator Modernization Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time insights into building modernization opportunities
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                const response = await exportAPI.applyExportTemplate('hot_opportunities', 'csv');
                downloadFile(response.data, `hot_opportunities_${new Date().toISOString().split('T')[0]}.csv`);
              } catch (err) {
                console.error('Export failed:', err);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Quick Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Buildings"
          value={statistics.totalBuildings.toLocaleString()}
          icon={Building2}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Critical Opportunities"
          value={statistics.criticalOpportunities.toLocaleString()}
          icon={AlertCircle}
          color="red"
          subtitle="Score > 85"
        />
        <StatCard
          title="Average Score"
          value={statistics.averageScore.toFixed(1)}
          icon={TrendingUp}
          color="green"
          trend="+5.2%"
        />
        <StatCard
          title="Total Violations"
          value={statistics.totalViolations.toLocaleString()}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="High Priority"
          value={statistics.highPriorityCount.toLocaleString()}
          icon={Target}
          color="purple"
          subtitle="Immediate action"
        />
        <StatCard
          title="Est. Total Value"
          value={`$${(statistics.totalEstimatedValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="green"
          trend="+18%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Opportunities */}
        <div className="lg:col-span-2">
          <HotOpportunities />
        </div>

        {/* Score Distribution Chart */}
        <div>
          <ScoreDistributionChart />
        </div>

        {/* Borough Distribution */}
        <div>
          <BoroughDistribution />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;