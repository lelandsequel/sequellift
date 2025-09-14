import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Share2,
  Printer,
  Eye,
  Plus,
  Edit3,
  Save,
  Star,
  Clock,
  DollarSign,
  Shield,
  Activity,
  Camera,
  Wrench,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Users,
  Briefcase,
  Award,
  Target,
  Gauge
} from 'lucide-react';
import { buildingsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Import tab components (to be created)
import OverviewTab from '../components/buildingProfile/OverviewTab';
import ElevatorDetailsTab from '../components/buildingProfile/ElevatorDetailsTab';
import ViolationsTab from '../components/buildingProfile/ViolationsTab';
import OpportunityAnalysisTab from '../components/buildingProfile/OpportunityAnalysisTab';
import ContactsSection from '../components/buildingProfile/ContactsSection';
import NotesSection from '../components/buildingProfile/NotesSection';
import RelatedBuildings from '../components/buildingProfile/RelatedBuildings';

interface BuildingDetails {
  id: string;
  bin_number: string;
  building_name?: string;
  address: string;
  borough: string;
  zip_code: string;
  neighborhood?: string;
  year_built: number;
  floors_above_grade: number;
  floors_below_grade?: number;
  building_type?: string;
  building_class?: string;
  total_units?: number;
  property_value?: number;
  lot_area?: number;
  building_area?: number;
  opportunity_score: number;
  priority_level: 'Critical' | 'High' | 'Medium' | 'Low';
  estimated_project_value?: number;
  estimated_roi?: number;
  total_violations?: number;
  elevator_count?: number;
  owner_name?: string;
  owner_contact?: string;
  property_manager?: string;
  property_manager_contact?: string;
  management_company?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
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

const BuildingProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactsPanel, setShowContactsPanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'elevators', label: 'Elevator Details', icon: Wrench },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'opportunity', label: 'Opportunity Analysis', icon: TrendingUp }
  ];

  useEffect(() => {
    if (id) {
      fetchBuildingDetails();
      checkFavoriteStatus();
    }
  }, [id]);

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await buildingsAPI.getBuildingById(id!);
      
      // Simulate additional data for demo purposes
      const enrichedBuilding = {
        ...response.data.data,
        neighborhood: getNeighborhood(response.data.data.borough),
        building_class: 'B',
        total_units: Math.floor(response.data.data.floors_above_grade * 8),
        property_value: Math.floor(Math.random() * 50000000) + 10000000,
        lot_area: Math.floor(Math.random() * 10000) + 5000,
        building_area: Math.floor(Math.random() * 50000) + 20000,
        owner_name: 'NYC Property Holdings LLC',
        owner_contact: '(212) 555-0100',
        property_manager: 'Metro Management Group',
        property_manager_contact: '(212) 555-0200',
        management_company: 'Metro Management Group',
        last_inspection_date: '2024-03-15',
        next_inspection_date: '2025-03-15',
        floors_below_grade: Math.floor(Math.random() * 3) + 1
      };
      
      setBuilding(enrichedBuilding);
    } catch (err) {
      setError('Failed to load building details. Please try again.');
      console.error('Error fetching building:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNeighborhood = (borough: string) => {
    const neighborhoods: { [key: string]: string[] } = {
      'Manhattan': ['Upper East Side', 'Upper West Side', 'Midtown', 'Chelsea', 'SoHo', 'Tribeca'],
      'Brooklyn': ['Williamsburg', 'DUMBO', 'Park Slope', 'Brooklyn Heights', 'Bed-Stuy'],
      'Queens': ['Astoria', 'Long Island City', 'Flushing', 'Jackson Heights'],
      'Bronx': ['Riverdale', 'Fordham', 'Pelham Bay', 'Morris Park'],
      'Staten Island': ['St. George', 'Stapleton', 'New Brighton']
    };
    const boroughNeighborhoods = neighborhoods[borough] || ['Downtown'];
    return boroughNeighborhoods[Math.floor(Math.random() * boroughNeighborhoods.length)];
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteBuildings') || '[]');
    setIsFavorite(favorites.includes(id));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteBuildings') || '[]');
    if (isFavorite) {
      const updated = favorites.filter((fId: string) => fId !== id);
      localStorage.setItem('favoriteBuildings', JSON.stringify(updated));
    } else {
      favorites.push(id);
      localStorage.setItem('favoriteBuildings', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-red-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'High': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'Low': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    };
    return config[priority as keyof typeof config] || config.Low;
  };

  // Action handlers
  const handleGenerateProposal = () => {
    console.log('Generating proposal for building:', id);
    // Implement proposal generation
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF for building:', id);
    // Implement PDF export
  };

  const handleAddToOpportunityList = () => {
    console.log('Adding to opportunity list:', id);
    // Implement add to list
  };

  const handleScheduleVisit = () => {
    console.log('Scheduling site visit for:', id);
    // Implement visit scheduling
  };

  const handleShare = () => {
    const url = `${window.location.origin}/building/${id}`;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Loading building profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBuildingDetails} />;
  if (!building) return <ErrorMessage message="Building not found" />;

  const priorityConfig = getPriorityBadge(building.priority_level);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-[#004b87]">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/buildings" className="hover:text-[#004b87]">Buildings</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">
          {building.building_name || building.address}
        </span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#004b87] rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#004b87]">
                {building.building_name || building.address}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{building.borough}, NY {building.zip_code}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Built {building.year_built}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>BIN: {building.bin_number}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
                  {building.priority_level} Priority
                </span>
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${getScoreColor(building.opportunity_score)}`}>
                    {building.opportunity_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">Opportunity Score</span>
                </div>
                {building.estimated_project_value && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900">
                      ${(building.estimated_project_value / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-sm text-gray-500">Est. Value</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateProposal}
            className="px-4 py-2 bg-[#004b87] text-white rounded-lg hover:bg-[#003a6c] transition-colors flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Proposal</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleAddToOpportunityList}
            className="px-4 py-2 bg-[#ff6319] text-white rounded-lg hover:bg-[#e5541a] transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add to List</span>
          </button>
          <button
            onClick={handleScheduleVisit}
            className="px-4 py-2 border border-[#004b87] text-[#004b87] rounded-lg hover:bg-[#004b87] hover:text-white transition-colors flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Visit</span>
          </button>
          <button
            onClick={() => setShowContactsPanel(!showContactsPanel)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Contacts</span>
          </button>
          <button
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Notes</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Section - Takes 3 columns */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="bg-white rounded-t-lg shadow-sm border-b">
            <div className="flex space-x-1 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#004b87] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg shadow-sm p-6">
            {activeTab === 'overview' && <OverviewTab building={building} />}
            {activeTab === 'elevators' && <ElevatorDetailsTab buildingId={building.id} />}
            {activeTab === 'violations' && <ViolationsTab buildingId={building.id} />}
            {activeTab === 'opportunity' && <OpportunityAnalysisTab building={building} />}
          </div>
        </div>

        {/* Right Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-[#004b87] mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Elevators</span>
                <span className="font-semibold">{building.elevator_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Violations</span>
                <span className="font-semibold text-orange-600">{building.total_violations || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Building Age</span>
                <span className="font-semibold">{new Date().getFullYear() - building.year_built} years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Floors</span>
                <span className="font-semibold">{building.floors_above_grade}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Building Class</span>
                <span className="font-semibold">{building.building_class || 'N/A'}</span>
              </div>
              {building.estimated_roi && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. ROI</span>
                  <span className="font-semibold text-green-600">{building.estimated_roi.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Contacts (if panel not open) */}
          {!showContactsPanel && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-[#004b87] mb-4">Key Contacts</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-[#ff6319] pl-3">
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-medium">{building.owner_name || 'Not Available'}</p>
                  {building.owner_contact && (
                    <p className="text-sm text-gray-500">{building.owner_contact}</p>
                  )}
                </div>
                <div className="border-l-4 border-[#004b87] pl-3">
                  <p className="text-sm text-gray-600">Property Manager</p>
                  <p className="font-medium">{building.property_manager || 'Not Available'}</p>
                  {building.property_manager_contact && (
                    <p className="text-sm text-gray-500">{building.property_manager_contact}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowContactsPanel(true)}
                className="mt-4 w-full px-4 py-2 text-sm text-[#004b87] border border-[#004b87] rounded-lg hover:bg-[#004b87] hover:text-white transition-colors"
              >
                View All Contacts
              </button>
            </div>
          )}

          {/* Related Buildings */}
          <RelatedBuildings 
            currentBuildingId={building.id} 
            owner={building.owner_name}
            borough={building.borough}
            score={building.opportunity_score}
          />
        </div>
      </div>

      {/* Sliding Panels */}
      {/* Contacts Panel */}
      {showContactsPanel && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto">
          <ContactsSection 
            buildingId={building.id}
            onClose={() => setShowContactsPanel(false)}
            initialContacts={{
              owner: {
                name: building.owner_name || '',
                contact: building.owner_contact || ''
              },
              manager: {
                name: building.property_manager || '',
                contact: building.property_manager_contact || ''
              }
            }}
          />
        </div>
      )}

      {/* Notes Panel */}
      {showNotesPanel && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto">
          <NotesSection 
            buildingId={building.id}
            onClose={() => setShowNotesPanel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default BuildingProfile;