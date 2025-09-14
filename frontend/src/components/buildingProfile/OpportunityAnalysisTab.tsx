import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Users,
  Building2,
  Gauge,
  Calculator,
  FileText,
  ChevronRight
} from 'lucide-react';

interface BuildingDetails {
  id: string;
  opportunity_score: number;
  priority_level: string;
  estimated_project_value?: number;
  estimated_roi?: number;
  score_breakdown?: {
    total_score: number;
    age_score: number;
    violation_score: number;
    elevator_age_score: number;
    sale_activity_score: number;
    upgrade_potential_score: number;
    factors: {
      years_since_modernization: number;
      violation_count: number;
      building_age: number;
      elevator_age: number;
      recent_sale: boolean;
      building_class: string;
    };
  };
}

interface OpportunityAnalysisTabProps {
  building: BuildingDetails;
}

const OpportunityAnalysisTab: React.FC<OpportunityAnalysisTabProps> = ({ building }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1year' | '3years' | '5years'>('3years');
  const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);

  // Mock data for charts and analysis
  const roiProjection = {
    '1year': [
      { month: 'Month 1', investment: 1000000, return: 0 },
      { month: 'Month 3', investment: 1000000, return: 50000 },
      { month: 'Month 6', investment: 1000000, return: 150000 },
      { month: 'Month 9', investment: 1000000, return: 300000 },
      { month: 'Month 12', investment: 1000000, return: 500000 }
    ],
    '3years': [
      { month: 'Year 1', investment: 1000000, return: 500000 },
      { month: 'Year 2', investment: 1000000, return: 1200000 },
      { month: 'Year 3', investment: 1000000, return: 2000000 }
    ],
    '5years': [
      { month: 'Year 1', investment: 1000000, return: 500000 },
      { month: 'Year 2', investment: 1000000, return: 1200000 },
      { month: 'Year 3', investment: 1000000, return: 2000000 },
      { month: 'Year 4', investment: 1000000, return: 2800000 },
      { month: 'Year 5', investment: 1000000, return: 3800000 }
    ]
  };

  const competitorActivity = [
    { company: 'Otis', projects: 12, marketShare: 35 },
    { company: 'KONE', projects: 8, marketShare: 25 },
    { company: 'Schindler', projects: 6, marketShare: 18 },
    { company: 'ThyssenKrupp', projects: 5, marketShare: 15 },
    { company: 'Others', projects: 3, marketShare: 7 }
  ];

  const modernizationTimeline = [
    { phase: 'Initial Assessment', duration: '2 weeks', status: 'pending', description: 'Site survey and technical evaluation' },
    { phase: 'Proposal & Contract', duration: '3 weeks', status: 'pending', description: 'Detailed proposal and contract negotiation' },
    { phase: 'Permits & Approvals', duration: '4 weeks', status: 'pending', description: 'DOB permits and building approvals' },
    { phase: 'Equipment Ordering', duration: '8 weeks', status: 'pending', description: 'Order custom equipment and components' },
    { phase: 'Installation', duration: '12 weeks', status: 'pending', description: 'Physical installation and testing' },
    { phase: 'Final Inspection', duration: '1 week', status: 'pending', description: 'DOB inspection and certification' }
  ];

  const financialMetrics = {
    totalInvestment: building.estimated_project_value || 1000000,
    annualSavings: 125000,
    paybackPeriod: 5.2,
    irr: 18.5,
    npv: 850000,
    energySavings: 35,
    maintenanceSavings: 45000,
    propertyValueIncrease: 2500000
  };

  const riskFactors = [
    { factor: 'Building Age', level: 'High', impact: 'Major', mitigation: 'Comprehensive modernization plan' },
    { factor: 'Violation History', level: 'Medium', impact: 'Moderate', mitigation: 'Address all violations during upgrade' },
    { factor: 'Tenant Disruption', level: 'Low', impact: 'Minor', mitigation: 'Phased installation approach' },
    { factor: 'Budget Overrun', level: 'Medium', impact: 'Moderate', mitigation: 'Fixed-price contract with contingency' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#ef4444'; // red
    if (score >= 70) return '#f97316'; // orange
    if (score >= 50) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-red-500 to-red-600';
    if (score >= 70) return 'from-orange-500 to-orange-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  // Calculate score percentages
  const scoreBreakdown = building.score_breakdown || {
    age_score: 25,
    violation_score: 20,
    elevator_age_score: 18,
    sale_activity_score: 12,
    upgrade_potential_score: 25
  };

  const scoreComponents = [
    { 
      name: 'Years Since Modernization', 
      value: scoreBreakdown.age_score, 
      weight: 30,
      icon: Clock,
      color: 'bg-blue-500'
    },
    { 
      name: 'Violation Count', 
      value: scoreBreakdown.violation_score, 
      weight: 25,
      icon: AlertCircle,
      color: 'bg-red-500'
    },
    { 
      name: 'Building/Elevator Age', 
      value: scoreBreakdown.elevator_age_score, 
      weight: 20,
      icon: Building2,
      color: 'bg-yellow-500'
    },
    { 
      name: 'Recent Sales Activity', 
      value: scoreBreakdown.sale_activity_score, 
      weight: 15,
      icon: Activity,
      color: 'bg-green-500'
    },
    { 
      name: 'Building Class Potential', 
      value: scoreBreakdown.upgrade_potential_score, 
      weight: 10,
      icon: Award,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Opportunity Score Overview */}
      <div className="bg-gradient-to-r from-[#004b87] to-[#003a6c] rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4">Opportunity Score</h3>
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={getScoreColor(building.opportunity_score)}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(building.opportunity_score / 100) * 553} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{building.opportunity_score.toFixed(0)}</span>
                <span className="text-sm opacity-80">out of 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20`}>
                {building.priority_level} Priority
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Financial Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Project Value</span>
                <span className="text-xl font-bold">
                  {formatCurrency(financialMetrics.totalInvestment)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Estimated ROI</span>
                <span className="text-xl font-bold text-green-300">
                  {building.estimated_roi?.toFixed(1) || financialMetrics.irr}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Payback Period</span>
                <span className="text-xl font-bold">
                  {financialMetrics.paybackPeriod} years
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Annual Savings</span>
                <span className="text-xl font-bold text-yellow-300">
                  {formatCurrency(financialMetrics.annualSavings)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Calculate Custom ROI</span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Generate Proposal</span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          Score Breakdown Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {scoreComponents.map((component) => {
              const Icon = component.icon;
              const contribution = (component.value * component.weight) / 100;
              
              return (
                <div key={component.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{component.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{contribution.toFixed(1)} pts</span>
                      <span className="text-xs text-gray-500 ml-1">({component.weight}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${component.color} transition-all duration-300`}
                      style={{ width: `${component.value}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Key Factors</h4>
            {building.score_breakdown?.factors && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Years Since Modernization</span>
                  <span className="font-medium">{building.score_breakdown.factors.years_since_modernization} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Violation Count</span>
                  <span className="font-medium text-orange-600">{building.score_breakdown.factors.violation_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Building Age</span>
                  <span className="font-medium">{building.score_breakdown.factors.building_age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Elevator Age</span>
                  <span className="font-medium">{building.score_breakdown.factors.elevator_age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Sale Activity</span>
                  <span className="font-medium">{building.score_breakdown.factors.recent_sale ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Building Class</span>
                  <span className="font-medium">Class {building.score_breakdown.factors.building_class}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Projection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#004b87] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            ROI Projection
          </h3>
          <div className="flex space-x-2">
            {(['1year', '3years', '5years'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-[#004b87] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe === '1year' ? '1 Year' : timeframe === '3years' ? '3 Years' : '5 Years'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {roiProjection[selectedTimeframe].map((data, index) => {
            const maxReturn = Math.max(...roiProjection[selectedTimeframe].map(d => d.return));
            const returnHeight = (data.return / maxReturn) * 100;
            const profitMargin = ((data.return - data.investment) / data.investment) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center mb-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {profitMargin > 0 ? `+${profitMargin.toFixed(0)}%` : `${profitMargin.toFixed(0)}%`}
                  </span>
                  <div className="relative w-full h-48 flex items-end">
                    <div className="absolute bottom-0 w-full bg-gray-200 rounded-t" style={{ height: '100%' }}></div>
                    <div 
                      className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${
                        profitMargin > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${returnHeight}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{data.month}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Total Investment</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(financialMetrics.totalInvestment)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected Return</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(roiProjection[selectedTimeframe][roiProjection[selectedTimeframe].length - 1].return)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-lg font-semibold text-[#ff6319]">
              {formatCurrency(roiProjection[selectedTimeframe][roiProjection[selectedTimeframe].length - 1].return - financialMetrics.totalInvestment)}
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Competitor Activity (Area)
            </div>
            <button
              onClick={() => setShowCompetitorAnalysis(!showCompetitorAnalysis)}
              className="text-sm text-[#004b87] hover:underline"
            >
              {showCompetitorAnalysis ? 'Hide' : 'Show'} Details
            </button>
          </h3>
          <div className="space-y-3">
            {competitorActivity.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium">{competitor.company}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{competitor.projects} projects</span>
                  <div className="w-24">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${competitor.marketShare}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{competitor.marketShare}%</span>
                </div>
              </div>
            ))}
          </div>
          {showCompetitorAnalysis && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Market Insight:</strong> Otis currently dominates this area with 35% market share. 
                However, recent sales activity and building age profile suggest strong opportunity for competitive proposals.
              </p>
            </div>
          )}
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Risk Assessment
          </h3>
          <div className="space-y-3">
            {riskFactors.map((risk, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{risk.factor}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    risk.level === 'High' ? 'bg-red-100 text-red-800' :
                    risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.level} Risk
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">Impact: {risk.impact}</p>
                <p className="text-xs text-gray-500">Mitigation: {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modernization Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Recommended Modernization Timeline
        </h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-4">
            {modernizationTimeline.map((phase, index) => (
              <div key={index} className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-[#004b87]' : 'bg-gray-300'
                  } border-4 border-white`}></div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                    <span className="text-sm text-gray-500">{phase.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Project Duration</p>
                <p className="text-xs text-gray-600">Including all phases and contingencies</p>
              </div>
              <p className="text-2xl font-bold text-[#004b87]">30 weeks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Benefits Summary */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Expected Financial Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-gray-600">Energy Savings</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{financialMetrics.energySavings}%</p>
            <p className="text-xs text-gray-500">Annual reduction</p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600">Maintenance Savings</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(financialMetrics.maintenanceSavings)}</p>
            <p className="text-xs text-gray-500">Per year</p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">Property Value</p>
            </div>
            <p className="text-xl font-bold text-gray-900">+{(financialMetrics.propertyValueIncrease / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500">Estimated increase</p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600">Net Present Value</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(financialMetrics.npv)}</p>
            <p className="text-xs text-gray-500">10-year NPV</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityAnalysisTab;