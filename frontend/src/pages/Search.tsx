import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search as SearchIcon,
  Filter,
  Grid3x3,
  List,
  Download,
  Save,
  History,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  Home,
  Layers,
  DollarSign,
  Eye,
  Plus,
  Share2,
  FileText,
  BarChart3
} from 'lucide-react';
import { buildingsAPI } from '../services/api';
import { Building } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { debounce } from 'lodash';

// NYC Neighborhoods by borough
const NYC_NEIGHBORHOODS = {
  Manhattan: ['Upper East Side', 'Upper West Side', 'Midtown', 'Chelsea', 'SoHo', 'Tribeca', 'Financial District', 'Harlem', 'East Village', 'West Village'],
  Brooklyn: ['Williamsburg', 'DUMBO', 'Park Slope', 'Brooklyn Heights', 'Bed-Stuy', 'Crown Heights', 'Bushwick', 'Fort Greene', 'Prospect Heights', 'Greenpoint'],
  Queens: ['Astoria', 'Long Island City', 'Flushing', 'Jackson Heights', 'Forest Hills', 'Sunnyside', 'Bayside', 'Jamaica', 'Elmhurst', 'Corona'],
  Bronx: ['Riverdale', 'Fordham', 'Pelham Bay', 'Morris Park', 'Kingsbridge', 'Hunts Point', 'Mott Haven', 'Concourse', 'Throgs Neck', 'City Island'],
  'Staten Island': ['St. George', 'Stapleton', 'Tompkinsville', 'New Brighton', 'Port Richmond', 'Mariners Harbor', 'Great Kills', 'Tottenville', 'Charleston', 'Richmond Valley']
};

// Building classes
const BUILDING_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F'];

// Elevator manufacturers
const ELEVATOR_MANUFACTURERS = ['Otis', 'KONE', 'Schindler', 'ThyssenKrupp', 'Mitsubishi', 'Fujitec', 'Hitachi', 'Toshiba'];

// Quick filter presets
const QUICK_FILTERS = [
  { id: 'immediate', name: 'Immediate Opportunities', icon: TrendingUp, filters: { minScore: 85 } },
  { id: 'compliance', name: 'Upcoming Compliance Deadlines', icon: Clock, filters: { priority: ['Critical', 'High'] } },
  { id: 'highrise', name: 'High-Rise Buildings', icon: Building2, filters: { minFloors: 40 } },
  { id: 'recent', name: 'Recent Violations', icon: AlertTriangle, filters: { recentViolations: true } },
  { id: 'manhattan', name: 'Manhattan Premium Buildings', icon: Home, filters: { boroughs: ['Manhattan'], minScore: 70 } }
];

interface SearchFilters {
  searchQuery: string;
  boroughs: string[];
  zipCode: string;
  neighborhoods: string[];
  yearBuiltMin: number;
  yearBuiltMax: number;
  floorsMin: number;
  floorsMax: number;
  buildingClasses: string[];
  unitsMin?: number;
  unitsMax?: number;
  inspectionGrades: string[];
  violationsMin: number;
  violationsMax: number;
  yearsSinceModernization?: number;
  manufacturers: string[];
  minScore: number;
  maxScore: number;
  priority: string[];
  projectValueMin?: number;
  projectValueMax?: number;
  recentSales: boolean;
  recentViolations: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  timestamp: string;
}

const Search: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    boroughs: [],
    zipCode: '',
    neighborhoods: [],
    yearBuiltMin: 1900,
    yearBuiltMax: 2024,
    floorsMin: 1,
    floorsMax: 120,
    buildingClasses: [],
    inspectionGrades: [],
    violationsMin: 0,
    violationsMax: 50,
    manufacturers: [],
    minScore: 0,
    maxScore: 100,
    priority: [],
    recentSales: false,
    recentViolations: false
  });

  const [results, setResults] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('opportunity_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['geographic', 'building', 'elevator', 'opportunity']);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchFilters[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalProjectValue, setTotalProjectValue] = useState(0);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Load saved searches and preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }

    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    const viewPref = localStorage.getItem('searchViewMode');
    if (viewPref) {
      setViewMode(viewPref as 'grid' | 'list');
    }

    const sortPref = localStorage.getItem('searchSortPreference');
    if (sortPref) {
      const { sortBy, sortOrder } = JSON.parse(sortPref);
      setSortBy(sortBy);
      setSortOrder(sortOrder);
    }
  }, []);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.boroughs.length > 0) count++;
    if (filters.zipCode) count++;
    if (filters.neighborhoods.length > 0) count++;
    if (filters.yearBuiltMin !== 1900 || filters.yearBuiltMax !== 2024) count++;
    if (filters.floorsMin !== 1 || filters.floorsMax !== 120) count++;
    if (filters.buildingClasses.length > 0) count++;
    if (filters.inspectionGrades.length > 0) count++;
    if (filters.violationsMin !== 0 || filters.violationsMax !== 50) count++;
    if (filters.manufacturers.length > 0) count++;
    if (filters.minScore !== 0 || filters.maxScore !== 100) count++;
    if (filters.priority.length > 0) count++;
    if (filters.recentSales) count++;
    if (filters.recentViolations) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page,
          limit: 20,
          sort: sortBy,
          order: sortOrder
        };

        // Add filters to params
        if (searchFilters.searchQuery) params.search = searchFilters.searchQuery;
        if (searchFilters.boroughs.length > 0) params.borough = searchFilters.boroughs.join(',');
        if (searchFilters.zipCode) params.zipCode = searchFilters.zipCode;
        if (searchFilters.minScore > 0) params.minScore = searchFilters.minScore;
        if (searchFilters.maxScore < 100) params.maxScore = searchFilters.maxScore;
        if (searchFilters.priority.length > 0) params.priority = searchFilters.priority.join(',');
        if (searchFilters.floorsMin > 1) params.minFloors = searchFilters.floorsMin;
        if (searchFilters.floorsMax < 120) params.maxFloors = searchFilters.floorsMax;
        if (searchFilters.yearBuiltMin > 1900) params.minYear = searchFilters.yearBuiltMin;
        if (searchFilters.yearBuiltMax < 2024) params.maxYear = searchFilters.yearBuiltMax;
        if (searchFilters.violationsMin > 0) params.minViolations = searchFilters.violationsMin;
        if (searchFilters.violationsMax < 50) params.maxViolations = searchFilters.violationsMax;

        const response = await buildingsAPI.searchBuildings(params);
        setResults(response.data.data);
        setTotalResults(response.data.total);
        
        // Calculate statistics
        if (response.data.data.length > 0) {
          const avgScore = response.data.data.reduce((sum: number, b: Building) => sum + b.opportunity_score, 0) / response.data.data.length;
          setAverageScore(avgScore);
          
          const totalValue = response.data.data.reduce((sum: number, b: Building) => sum + (b.estimated_project_value || 0), 0);
          setTotalProjectValue(totalValue);
        }

        // Save to history
        const newHistory = [searchFilters, ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (err) {
        setError('Failed to search buildings. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [page, sortBy, sortOrder, searchHistory]
  );

  // Trigger search when filters change
  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  // Filter section toggle
  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      boroughs: [],
      zipCode: '',
      neighborhoods: [],
      yearBuiltMin: 1900,
      yearBuiltMax: 2024,
      floorsMin: 1,
      floorsMax: 120,
      buildingClasses: [],
      inspectionGrades: [],
      violationsMin: 0,
      violationsMax: 50,
      manufacturers: [],
      minScore: 0,
      maxScore: 100,
      priority: [],
      recentSales: false,
      recentViolations: false
    });
    setPage(1);
  };

  // Apply quick filter
  const applyQuickFilter = (quickFilter: any) => {
    const newFilters = { ...filters };
    Object.keys(quickFilter.filters).forEach(key => {
      (newFilters as any)[key] = quickFilter.filters[key];
    });
    setFilters(newFilters);
    setPage(1);
  };

  // Save current search
  const saveSearch = () => {
    if (!searchName) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters },
      timestamp: new Date().toISOString()
    };

    const updatedSaves = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSaves);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSaves));
    setShowSaveDialog(false);
    setSearchName('');
  };

  // Load saved search
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setPage(1);
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updatedSaves = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updatedSaves);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSaves));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Address', 'Borough', 'ZIP', 'Year Built', 'Floors', 'Elevators', 'Violations', 'Score', 'Priority'];
    const rows = results.map(b => [
      b.address,
      b.borough,
      b.zip_code,
      b.year_built,
      b.floors_above_grade,
      b.elevator_count || 0,
      b.total_violations || 0,
      b.opportunity_score,
      b.priority_level
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elevator-opportunities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Copy shareable link
  const copyShareableLink = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.append(key, Array.isArray(value) ? value.join(',') : value.toString());
      }
    });
    const shareUrl = `${window.location.origin}/search?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    const colors = {
      'Critical': 'bg-red-600',
      'High': 'bg-orange-600',
      'Medium': 'bg-yellow-600',
      'Low': 'bg-green-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-600';
  };

  // Save view preference
  useEffect(() => {
    localStorage.setItem('searchViewMode', viewMode);
  }, [viewMode]);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem('searchSortPreference', JSON.stringify({ sortBy, sortOrder }));
  }, [sortBy, sortOrder]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Sidebar - Filters */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#004b87] flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-[#004b87] transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by address or building name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b87]"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h3>
          <div className="space-y-2">
            {QUICK_FILTERS.map(qf => {
              const Icon = qf.icon;
              return (
                <button
                  key={qf.id}
                  onClick={() => applyQuickFilter(qf)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4 text-[#ff6319]" />
                  <span>{qf.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Geographic Filters */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleFilterSection('geographic')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">Geographic Filters</span>
            {expandedFilters.includes('geographic') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedFilters.includes('geographic') && (
            <div className="px-4 pb-4 space-y-3">
              {/* Borough Selection */}
              <div>
                <label className="text-sm font-medium text-gray-600">Borough</label>
                <div className="mt-1 space-y-1">
                  {['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'].map(borough => (
                    <label key={borough} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.boroughs.includes(borough)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, boroughs: [...filters.boroughs, borough] });
                          } else {
                            setFilters({ ...filters, boroughs: filters.boroughs.filter(b => b !== borough) });
                          }
                        }}
                        className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                      />
                      <span className="text-sm">{borough}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ZIP Code */}
              <div>
                <label className="text-sm font-medium text-gray-600">ZIP Code</label>
                <input
                  type="text"
                  value={filters.zipCode}
                  onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                  placeholder="e.g., 10001"
                  className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              {/* Neighborhoods */}
              {filters.boroughs.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Neighborhoods</label>
                  <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                    {filters.boroughs.flatMap(borough => 
                      NYC_NEIGHBORHOODS[borough as keyof typeof NYC_NEIGHBORHOODS] || []
                    ).map(neighborhood => (
                      <label key={neighborhood} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.neighborhoods.includes(neighborhood)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, neighborhoods: [...filters.neighborhoods, neighborhood] });
                            } else {
                              setFilters({ ...filters, neighborhoods: filters.neighborhoods.filter(n => n !== neighborhood) });
                            }
                          }}
                          className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                        />
                        <span className="text-sm">{neighborhood}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Building Characteristics */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleFilterSection('building')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">Building Characteristics</span>
            {expandedFilters.includes('building') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedFilters.includes('building') && (
            <div className="px-4 pb-4 space-y-3">
              {/* Year Built Range */}
              <div>
                <label className="text-sm font-medium text-gray-600">Year Built</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    value={filters.yearBuiltMin}
                    onChange={(e) => setFilters({ ...filters, yearBuiltMin: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    value={filters.yearBuiltMax}
                    onChange={(e) => setFilters({ ...filters, yearBuiltMax: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>
              </div>

              {/* Floors Range */}
              <div>
                <label className="text-sm font-medium text-gray-600">Number of Floors</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={filters.floorsMin}
                    onChange={(e) => setFilters({ ...filters, floorsMin: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={filters.floorsMax}
                    onChange={(e) => setFilters({ ...filters, floorsMax: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>
              </div>

              {/* Building Class */}
              <div>
                <label className="text-sm font-medium text-gray-600">Building Class</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {BUILDING_CLASSES.map(cls => (
                    <label key={cls} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.buildingClasses.includes(cls)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, buildingClasses: [...filters.buildingClasses, cls] });
                          } else {
                            setFilters({ ...filters, buildingClasses: filters.buildingClasses.filter(c => c !== cls) });
                          }
                        }}
                        className="mr-1 rounded text-[#004b87] focus:ring-[#004b87]"
                      />
                      <span className="text-sm">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Elevator Status */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleFilterSection('elevator')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">Elevator Status</span>
            {expandedFilters.includes('elevator') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedFilters.includes('elevator') && (
            <div className="px-4 pb-4 space-y-3">
              {/* Inspection Grades */}
              <div>
                <label className="text-sm font-medium text-gray-600">Last Inspection Grade</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {['A', 'B', 'C', 'D', 'F'].map(grade => (
                    <label key={grade} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.inspectionGrades.includes(grade)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, inspectionGrades: [...filters.inspectionGrades, grade] });
                          } else {
                            setFilters({ ...filters, inspectionGrades: filters.inspectionGrades.filter(g => g !== grade) });
                          }
                        }}
                        className="mr-1 rounded text-[#004b87] focus:ring-[#004b87]"
                      />
                      <span className="text-sm">{grade}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Violations Range */}
              <div>
                <label className="text-sm font-medium text-gray-600">Violation Count</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={filters.violationsMin}
                    onChange={(e) => setFilters({ ...filters, violationsMin: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={filters.violationsMax}
                    onChange={(e) => setFilters({ ...filters, violationsMax: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>
              </div>

              {/* Manufacturers */}
              <div>
                <label className="text-sm font-medium text-gray-600">Elevator Manufacturer</label>
                <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                  {ELEVATOR_MANUFACTURERS.map(manufacturer => (
                    <label key={manufacturer} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.manufacturers.includes(manufacturer)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, manufacturers: [...filters.manufacturers, manufacturer] });
                          } else {
                            setFilters({ ...filters, manufacturers: filters.manufacturers.filter(m => m !== manufacturer) });
                          }
                        }}
                        className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                      />
                      <span className="text-sm">{manufacturer}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opportunity Filters */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleFilterSection('opportunity')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">Opportunity Filters</span>
            {expandedFilters.includes('opportunity') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedFilters.includes('opportunity') && (
            <div className="px-4 pb-4 space-y-3">
              {/* Score Range */}
              <div>
                <label className="text-sm font-medium text-gray-600">Opportunity Score</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters({ ...filters, maxScore: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="text-sm font-medium text-gray-600">Priority Level</label>
                <div className="mt-1 space-y-1">
                  {['Critical', 'High', 'Medium', 'Low'].map(priority => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, priority: [...filters.priority, priority] });
                          } else {
                            setFilters({ ...filters, priority: filters.priority.filter(p => p !== priority) });
                          }
                        }}
                        className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                      />
                      <span className="text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recent Activity Toggles */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.recentSales}
                    onChange={(e) => setFilters({ ...filters, recentSales: e.target.checked })}
                    className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                  />
                  <span className="text-sm">Recent Sales Activity</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.recentViolations}
                    onChange={(e) => setFilters({ ...filters, recentViolations: e.target.checked })}
                    className="mr-2 rounded text-[#004b87] focus:ring-[#004b87]"
                  />
                  <span className="text-sm">Recent Violations (30 days)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Saved Searches */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Saved Searches</h3>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-sm text-[#ff6319] hover:text-[#004b87] transition-colors"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {savedSearches.map(saved => (
              <div key={saved.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                <button
                  onClick={() => loadSavedSearch(saved)}
                  className="flex-1 text-left text-sm text-gray-700 hover:text-[#004b87]"
                >
                  {saved.name}
                </button>
                <button
                  onClick={() => deleteSavedSearch(saved.id)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Results Count */}
              <div>
                <p className="text-2xl font-bold text-[#004b87]">{totalResults.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Buildings Found</p>
              </div>

              {/* Filter Stats */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Avg Score:</span>
                  <span className="font-semibold text-[#ff6319]">{averageScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-semibold text-green-600">${(totalProjectValue / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#004b87] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#004b87] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Options */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
              >
                <option value="opportunity_score-desc">Score (High to Low)</option>
                <option value="opportunity_score-asc">Score (Low to High)</option>
                <option value="year_built-asc">Year Built (Oldest)</option>
                <option value="year_built-desc">Year Built (Newest)</option>
                <option value="floors_above_grade-desc">Floors (Most)</option>
                <option value="floors_above_grade-asc">Floors (Least)</option>
                <option value="total_violations-desc">Violations (Most)</option>
                <option value="total_violations-asc">Violations (Least)</option>
              </select>

              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToCSV}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={copyShareableLink}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="Copy Shareable Link"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="Export to PDF (Coming Soon)"
                  disabled
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-500">Active Filters:</span>
              {filters.searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  Search: {filters.searchQuery}
                  <button
                    onClick={() => setFilters({ ...filters, searchQuery: '' })}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.boroughs.map(borough => (
                <span key={borough} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                  {borough}
                  <button
                    onClick={() => setFilters({ ...filters, boroughs: filters.boroughs.filter(b => b !== borough) })}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.priority.map(p => (
                <span key={p} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                  Priority: {p}
                  <button
                    onClick={() => setFilters({ ...filters, priority: filters.priority.filter(pr => pr !== p) })}
                    className="ml-1 text-orange-500 hover:text-orange-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(filters.minScore > 0 || filters.maxScore < 100) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Score: {filters.minScore}-{filters.maxScore}
                  <button
                    onClick={() => setFilters({ ...filters, minScore: 0, maxScore: 100 })}
                    className="ml-1 text-green-500 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading && <LoadingSpinner message="Searching buildings..." />}
          {error && <ErrorMessage message={error} onRetry={() => debouncedSearch(filters)} />}
          
          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No buildings found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(building => (
                    <div key={building.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                      {/* Building Image Placeholder */}
                      <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>

                      {/* Building Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {building.building_name || building.address}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {building.borough}, {building.zip_code}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getScoreColor(building.opportunity_score)}`}>
                            {building.opportunity_score.toFixed(1)}
                          </span>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Layers className="h-3 w-3 mr-1" />
                            {building.floors_above_grade} floors
                          </div>
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {building.elevator_count || 0} elevators
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                            {building.total_violations || 0} violations
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className={`inline-block w-2 h-2 rounded-full ${getPriorityBadge(building.priority_level)}`} />
                          <span className="text-xs text-gray-600">{building.priority_level} Priority</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          <button className="flex-1 flex items-center justify-center px-3 py-1 bg-[#004b87] text-white text-sm rounded-md hover:bg-[#003a6c] transition-colors">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                          <button className="flex-1 flex items-center justify-center px-3 py-1 border border-[#004b87] text-[#004b87] text-sm rounded-md hover:bg-gray-50 transition-colors">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </button>
                          <button className="p-1 text-gray-500 hover:text-[#ff6319] transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Floors</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Elevators</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map(building => (
                        <tr key={building.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {building.building_name || building.address}
                              </div>
                              <div className="text-xs text-gray-500">BIN: {building.bin_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{building.borough}</div>
                            <div className="text-xs text-gray-500">{building.zip_code}</div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{building.year_built}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{building.floors_above_grade}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{building.elevator_count || 0}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-orange-600">{building.total_violations || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreColor(building.opportunity_score)}`}>
                              {building.opportunity_score.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full ${getPriorityBadge(building.priority_level)}`} />
                              <span className="ml-2 text-xs text-gray-600">{building.priority_level}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button className="text-[#004b87] hover:text-[#003a6c]">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-500 hover:text-[#ff6319]">
                                <Plus className="h-4 w-4" />
                              </button>
                              <button className="text-gray-500 hover:text-gray-700">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 mr-2 rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                <span className="mx-4 text-sm text-gray-700">
                  Page {page} of {Math.ceil(totalResults / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(totalResults / 20)}
                  className={`px-4 py-2 ml-2 rounded-md ${
                    page >= Math.ceil(totalResults / 20)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-[#004b87] mb-4">Save Search</h3>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
            />
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveSearch}
                disabled={!searchName}
                className="px-4 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] disabled:bg-gray-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;