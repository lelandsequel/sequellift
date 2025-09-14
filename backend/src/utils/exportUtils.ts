import { Parser } from 'json2csv';
import { Building, Opportunity, Elevator, Violation } from '../types';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeRelated?: boolean;
  fields?: string[];
  dateFormat?: string;
}

export interface ExportResult {
  data: string | any;
  filename: string;
  mimeType: string;
}

// Format currency values
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format date values
export const formatDate = (date: Date | string | null, format = 'MM/DD/YYYY'): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

// Convert buildings data to CSV
export const exportBuildingsToCSV = (buildings: any[], options?: Partial<ExportOptions>): ExportResult => {
  const fields = options?.fields || [
    'building_id',
    'address',
    'borough',
    'zip_code',
    'building_name',
    'year_built',
    'floors',
    'units',
    'owner_name',
    'owner_type',
    'opportunity_score',
    'priority_level',
    'elevator_count',
    'violation_count',
    'critical_violations',
    'estimated_project_value',
    'created_at',
    'updated_at'
  ];

  const transformedData = buildings.map(building => ({
    building_id: building.building_id,
    address: building.address,
    borough: building.borough,
    zip_code: building.zip_code,
    building_name: building.building_name || '',
    year_built: building.year_built,
    floors: building.floors,
    units: building.units,
    owner_name: building.owner_name || '',
    owner_type: building.owner_type || '',
    opportunity_score: building.opportunity_score ? Number(building.opportunity_score).toFixed(2) : '0.00',
    priority_level: building.priority_level || '',
    elevator_count: building.elevator_count || 0,
    violation_count: building.violation_count || 0,
    critical_violations: building.critical_violations || 0,
    estimated_project_value: formatCurrency(building.estimated_project_value),
    created_at: formatDate(building.created_at),
    updated_at: formatDate(building.updated_at)
  }));

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transformedData);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `buildings_export_${timestamp}.csv`;

  return {
    data: csv,
    filename,
    mimeType: 'text/csv'
  };
};

// Convert opportunities data to CSV
export const exportOpportunitiesToCSV = (opportunities: any[], options?: Partial<ExportOptions>): ExportResult => {
  const fields = options?.fields || [
    'opportunity_id',
    'building_id',
    'building_address',
    'borough',
    'opportunity_type',
    'opportunity_score',
    'priority_level',
    'status',
    'elevator_count',
    'estimated_project_value',
    'compliance_deadline',
    'years_since_built',
    'violation_count',
    'critical_violations',
    'owner_name',
    'owner_contact',
    'created_at',
    'last_contact_date',
    'next_action'
  ];

  const transformedData = opportunities.map(opp => ({
    opportunity_id: opp.opportunity_id,
    building_id: opp.building_id,
    building_address: opp.building_address || opp.address || '',
    borough: opp.borough || '',
    opportunity_type: opp.opportunity_type || 'Modernization',
    opportunity_score: opp.opportunity_score ? Number(opp.opportunity_score).toFixed(2) : '0.00',
    priority_level: opp.priority_level || '',
    status: opp.status || 'New',
    elevator_count: opp.elevator_count || 0,
    estimated_project_value: formatCurrency(opp.estimated_project_value),
    compliance_deadline: formatDate(opp.compliance_deadline),
    years_since_built: opp.years_since_built || 0,
    violation_count: opp.violation_count || 0,
    critical_violations: opp.critical_violations || 0,
    owner_name: opp.owner_name || '',
    owner_contact: opp.owner_contact || '',
    created_at: formatDate(opp.created_at),
    last_contact_date: formatDate(opp.last_contact_date),
    next_action: opp.next_action || ''
  }));

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transformedData);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `opportunities_export_${timestamp}.csv`;

  return {
    data: csv,
    filename,
    mimeType: 'text/csv'
  };
};

// Convert violations data to CSV
export const exportViolationsToCSV = (violations: any[], options?: Partial<ExportOptions>): ExportResult => {
  const fields = options?.fields || [
    'violation_id',
    'building_id',
    'building_address',
    'borough',
    'violation_type',
    'severity',
    'status',
    'issue_date',
    'compliance_deadline',
    'description',
    'device_number',
    'floor',
    'resolution_date',
    'inspector_notes'
  ];

  const transformedData = violations.map(violation => ({
    violation_id: violation.violation_id,
    building_id: violation.building_id,
    building_address: violation.building_address || '',
    borough: violation.borough || '',
    violation_type: violation.violation_type || '',
    severity: violation.severity || '',
    status: violation.status || 'Open',
    issue_date: formatDate(violation.issue_date),
    compliance_deadline: formatDate(violation.compliance_deadline),
    description: violation.description || '',
    device_number: violation.device_number || '',
    floor: violation.floor || '',
    resolution_date: formatDate(violation.resolution_date),
    inspector_notes: violation.inspector_notes || ''
  }));

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transformedData);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `violations_export_${timestamp}.csv`;

  return {
    data: csv,
    filename,
    mimeType: 'text/csv'
  };
};

// Generate executive summary report data
export const generateExecutiveSummary = (data: any): any => {
  const timestamp = new Date().toISOString();
  
  return {
    report_type: 'Executive Summary',
    generated_at: timestamp,
    period: data.period || 'Last 30 Days',
    summary: {
      total_buildings: data.totalBuildings || 0,
      total_opportunities: data.totalOpportunities || 0,
      total_pipeline_value: formatCurrency(data.totalPipelineValue || 0),
      average_opportunity_score: data.averageScore?.toFixed(2) || '0.00',
      high_priority_count: data.highPriorityCount || 0,
      critical_violations: data.criticalViolations || 0
    },
    top_opportunities: data.topOpportunities || [],
    borough_distribution: data.boroughDistribution || {},
    score_distribution: data.scoreDistribution || {},
    recent_activity: data.recentActivity || []
  };
};

// Generate territory analysis report
export const generateTerritoryAnalysis = (data: any): any => {
  const timestamp = new Date().toISOString();
  
  return {
    report_type: 'Territory Analysis',
    generated_at: timestamp,
    territories: data.territories || [],
    territory_metrics: {
      manhattan: {
        buildings: data.manhattan?.buildings || 0,
        opportunities: data.manhattan?.opportunities || 0,
        pipeline_value: formatCurrency(data.manhattan?.pipelineValue || 0),
        avg_score: data.manhattan?.avgScore || 0
      },
      brooklyn: {
        buildings: data.brooklyn?.buildings || 0,
        opportunities: data.brooklyn?.opportunities || 0,
        pipeline_value: formatCurrency(data.brooklyn?.pipelineValue || 0),
        avg_score: data.brooklyn?.avgScore || 0
      },
      queens: {
        buildings: data.queens?.buildings || 0,
        opportunities: data.queens?.opportunities || 0,
        pipeline_value: formatCurrency(data.queens?.pipelineValue || 0),
        avg_score: data.queens?.avgScore || 0
      },
      bronx: {
        buildings: data.bronx?.buildings || 0,
        opportunities: data.bronx?.opportunities || 0,
        pipeline_value: formatCurrency(data.bronx?.pipelineValue || 0),
        avg_score: data.bronx?.avgScore || 0
      },
      staten_island: {
        buildings: data.statenIsland?.buildings || 0,
        opportunities: data.statenIsland?.opportunities || 0,
        pipeline_value: formatCurrency(data.statenIsland?.pipelineValue || 0),
        avg_score: data.statenIsland?.avgScore || 0
      }
    },
    hot_zones: data.hotZones || [],
    coverage_gaps: data.coverageGaps || []
  };
};

// Export template definitions
export const exportTemplates = {
  hot_opportunities: {
    name: 'Hot Opportunities Export',
    description: 'Top scoring buildings ready for modernization',
    filters: {
      minScore: 70,
      priority: 'high',
      limit: 50
    },
    fields: [
      'building_id',
      'address',
      'borough',
      'opportunity_score',
      'priority_level',
      'elevator_count',
      'estimated_project_value',
      'owner_name',
      'owner_contact'
    ]
  },
  quarterly_pipeline: {
    name: 'Quarterly Pipeline Report',
    description: 'All opportunities organized by priority',
    filters: {
      period: 'quarter'
    },
    fields: [
      'opportunity_id',
      'building_address',
      'opportunity_score',
      'priority_level',
      'status',
      'estimated_project_value',
      'next_action',
      'last_contact_date'
    ]
  },
  violation_alert: {
    name: 'Violation Alert Export',
    description: 'Buildings with critical compliance issues',
    filters: {
      hasCriticalViolations: true,
      violationStatus: 'open'
    },
    fields: [
      'building_id',
      'address',
      'violation_count',
      'critical_violations',
      'compliance_deadline',
      'owner_name',
      'owner_contact'
    ]
  },
  territory_assignment: {
    name: 'Territory Assignment Export',
    description: 'Buildings organized by geographic area',
    filters: {
      groupBy: 'borough'
    },
    fields: [
      'building_id',
      'address',
      'borough',
      'zip_code',
      'opportunity_score',
      'owner_name',
      'elevator_count'
    ]
  }
};

// Convert JSON data to specified format
export const convertToFormat = (data: any, format: 'csv' | 'json', options?: Partial<ExportOptions>): ExportResult => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  if (format === 'json') {
    return {
      data: JSON.stringify(data, null, 2),
      filename: `export_${timestamp}.json`,
      mimeType: 'application/json'
    };
  }
  
  // Default to CSV
  if (Array.isArray(data) && data.length > 0) {
    // Detect data type and use appropriate export function
    if (data[0].building_id && data[0].address) {
      return exportBuildingsToCSV(data, options);
    } else if (data[0].opportunity_id) {
      return exportOpportunitiesToCSV(data, options);
    } else if (data[0].violation_id) {
      return exportViolationsToCSV(data, options);
    }
  }
  
  // Generic CSV conversion
  const fields = options?.fields || (data.length > 0 ? Object.keys(data[0]) : []);
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);
  
  return {
    data: csv,
    filename: `export_${timestamp}.csv`,
    mimeType: 'text/csv'
  };
};