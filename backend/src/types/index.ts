export interface Building {
  id: number;
  building_id: string;
  address: string;
  borough: string;
  zip_code: string;
  year_built: number;
  floors: number;
  units: number;
  owner_name: string;
  owner_contact: string;
  property_manager: string;
  last_inspection_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Elevator {
  id: number;
  building_id: number;
  elevator_id: string;
  device_number: string;
  type: string;
  manufacturer: string;
  year_installed: number;
  capacity: number;
  floors_served: number;
  last_inspection_date: Date;
  inspection_status: string;
  modernization_year: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Violation {
  id: number;
  building_id: number;
  violation_id: string;
  violation_date: Date;
  violation_type: string;
  description: string;
  severity: string;
  status: string;
  resolution_date: Date | null;
  fine_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface Opportunity {
  id: number;
  building_id: number;
  opportunity_score: number;
  priority_level: string;
  estimated_value: number;
  modernization_potential: string;
  risk_factors: string;
  recommended_actions: string;
  roi_estimate: number;
  payback_period_years: number;
  energy_savings_potential: number;
  status: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface BuildingFilter {
  borough?: string;
  zip_code?: string;
  year_built_min?: number;
  year_built_max?: number;
  floors_min?: number;
  floors_max?: number;
  violation_count_min?: number;
  score_min?: number;
  last_inspection_from?: Date;
  last_inspection_to?: Date;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ScoreBreakdown {
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
}

export interface DashboardStatistics {
  total_buildings: number;
  critical_opportunities: number;
  average_opportunity_score: number;
  total_violations: number;
  open_violations: number;
  borough_distribution: { [borough: string]: number };
  violation_trend: { month: string; count: number }[];
  score_distribution: { range: string; count: number }[];
}