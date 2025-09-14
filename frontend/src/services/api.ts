import axios from 'axios';

// Create axios instance with base configuration
// In Replit, we need to use the relative path to access the backend
const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for error handling
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error: No response from server');
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Analytics endpoints
export const analyticsAPI = {
  getStatistics: () => API.get('/analytics/statistics'),
  getHotOpportunities: (limit = 10) => API.get(`/analytics/hot-opportunities?limit=${limit}`),
  getRecentViolations: () => API.get('/analytics/recent-violations'),
  getScoreDistribution: () => API.get('/analytics/score-distribution'),
  getROIAnalysis: () => API.get('/analytics/roi-analysis')
};

// Buildings endpoints
export const buildingsAPI = {
  getBuildings: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    borough?: string;
    minScore?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.borough) queryParams.append('borough', params.borough);
    if (params?.minScore) queryParams.append('minScore', params.minScore.toString());
    
    return API.get(`/buildings?${queryParams.toString()}`);
  },
  searchBuildings: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    borough?: string;
    zipCode?: string;
    minScore?: number;
    maxScore?: number;
    priority?: string;
    minFloors?: number;
    maxFloors?: number;
    minYear?: number;
    maxYear?: number;
    minViolations?: number;
    maxViolations?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.borough) queryParams.append('borough', params.borough);
    if (params?.zipCode) queryParams.append('zipCode', params.zipCode);
    if (params?.minScore) queryParams.append('minScore', params.minScore.toString());
    if (params?.maxScore) queryParams.append('maxScore', params.maxScore.toString());
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.minFloors) queryParams.append('minFloors', params.minFloors.toString());
    if (params?.maxFloors) queryParams.append('maxFloors', params.maxFloors.toString());
    if (params?.minYear) queryParams.append('minYear', params.minYear.toString());
    if (params?.maxYear) queryParams.append('maxYear', params.maxYear.toString());
    if (params?.minViolations) queryParams.append('minViolations', params.minViolations.toString());
    if (params?.maxViolations) queryParams.append('maxViolations', params.maxViolations.toString());
    
    return API.get(`/buildings?${queryParams.toString()}`);
  },
  getBuildingById: (id: string) => API.get(`/buildings/${id}`),
  getBuildingElevators: (id: string) => API.get(`/buildings/${id}/elevators`),
  getBuildingViolations: (id: string) => API.get(`/buildings/${id}/violations`),
  recalculateScore: (id: string) => API.post(`/buildings/${id}/recalculate-score`)
};

// Opportunities endpoints
export const opportunitiesAPI = {
  getOpportunities: (params?: {
    status?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    
    return API.get(`/opportunities?${queryParams.toString()}`);
  },
  updateOpportunityStatus: (id: string, status: string) => 
    API.patch(`/opportunities/${id}/status`, { status })
};

// Export endpoints
export const exportAPI = {
  exportBuildings: (params: {
    format?: 'csv' | 'json' | 'pdf';
    borough?: string;
    minScore?: number;
    maxScore?: number;
    priority?: string;
    limit?: number;
    includeElevators?: boolean;
    includeViolations?: boolean;
  }) => {
    return API.post('/exports/buildings', params, {
      responseType: 'blob'
    });
  },
  exportOpportunities: (params: {
    format?: 'csv' | 'json' | 'pdf';
    status?: string;
    priority?: string;
    minScore?: number;
    borough?: string;
    limit?: number;
  }) => {
    return API.post('/exports/opportunities', params, {
      responseType: 'blob'
    });
  },
  exportViolations: (params: {
    format?: 'csv' | 'json' | 'pdf';
    severity?: string;
    status?: string;
    borough?: string;
    buildingId?: string;
    limit?: number;
  }) => {
    return API.post('/exports/violations', params, {
      responseType: 'blob'
    });
  },
  generateReport: (params: {
    reportType: string;
    format?: 'csv' | 'json' | 'pdf';
    period?: string;
    borough?: string;
    includeCharts?: boolean;
  }) => {
    return API.post('/exports/report', params, {
      responseType: 'blob'
    });
  },
  getExportTemplates: () => API.get('/exports/templates'),
  applyExportTemplate: (templateId: string, format: 'csv' | 'json' | 'pdf' = 'csv') => {
    return API.post(`/exports/templates/${templateId}/apply`, { format }, {
      responseType: 'blob'
    });
  }
};

// Helper function to download blob as file
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default API;