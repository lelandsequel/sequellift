// Type definitions for the NYC Elevator Modernization app

export interface Building {
  id: string;
  bin_number: string;
  building_name?: string;
  address: string;
  borough: string;
  zip_code: string;
  year_built: number;
  floors_above_grade: number;
  building_type?: string;
  opportunity_score: number;
  priority_level: 'Critical' | 'High' | 'Medium' | 'Low';
  estimated_project_value?: number;
  estimated_roi?: number;
  total_violations?: number;
  elevator_count?: number;
}

export interface Elevator {
  id: string;
  device_number: string;
  device_type: string;
  device_status: string;
  floor_from: string;
  floor_to: string;
  year_installed?: number;
  last_inspection_date?: string;
  last_inspection_result?: string;
}

export interface Violation {
  id: string;
  violation_number: string;
  device_number: string;
  violation_date: string;
  violation_description: string;
  violation_category?: string;
  disposition_date?: string;
  disposition_comments?: string;
}

export interface Opportunity {
  id: string;
  building_id: string;
  opportunity_type: string;
  priority_level: 'Critical' | 'High' | 'Medium' | 'Low';
  estimated_value?: number;
  estimated_roi?: number;
  status: string;
  created_at: string;
  updated_at: string;
  building?: Building;
}

export interface DashboardStatistics {
  totalBuildings: number;
  criticalOpportunities: number;
  averageScore: number;
  totalViolations: number;
  highPriorityCount: number;
  totalEstimatedValue: number;
  boroughDistribution: Record<string, number>;
  scoreDistribution: Array<{ range: string; count: number }>;
  violationTrend: Array<any>;
}

export interface ScoreDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface BoroughDistribution {
  borough: string;
  count: number;
  averageScore: number;
}

export interface ROIAnalysis {
  priority_level: string;
  average_roi: number;
  total_value: number;
  building_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}