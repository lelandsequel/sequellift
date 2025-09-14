import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Home,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  User,
  Briefcase,
  FileText,
  Award,
  Square,
  Activity,
  Camera,
  ChevronRight,
  ExternalLink,
  Download,
  Edit3,
  Plus,
  X,
  Map
} from 'lucide-react';

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
  owner_name?: string;
  owner_contact?: string;
  property_manager?: string;
  property_manager_contact?: string;
  management_company?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
}

interface OverviewTabProps {
  building: BuildingDetails;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ building }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Simulated photo gallery
  const photos = [
    { id: 1, url: '/api/placeholder/400/300', caption: 'Building Exterior', date: '2024-03-15' },
    { id: 2, url: '/api/placeholder/400/300', caption: 'Lobby Entrance', date: '2024-03-15' },
    { id: 3, url: '/api/placeholder/400/300', caption: 'Elevator Bank', date: '2024-02-20' },
    { id: 4, url: '/api/placeholder/400/300', caption: 'Machine Room', date: '2024-02-20' },
    { id: 5, url: '/api/placeholder/400/300', caption: 'Street View', date: '2024-01-10' }
  ];

  // Simulated ownership history
  const ownershipHistory = [
    { year: 2023, owner: building.owner_name || 'NYC Property Holdings LLC', price: 45000000 },
    { year: 2018, owner: 'Manhattan Real Estate Trust', price: 38000000 },
    { year: 2012, owner: 'Urban Development Corp', price: 28000000 },
    { year: 2005, owner: 'City Properties Inc', price: 18000000 }
  ];

  // Simulated recent updates
  const recentUpdates = [
    { date: '2024-03-15', type: 'inspection', description: 'Annual elevator inspection completed' },
    { date: '2024-02-28', type: 'violation', description: 'New violation issued - Code 3.10.8' },
    { date: '2024-01-20', type: 'maintenance', description: 'Routine maintenance performed on Elevator #3' },
    { date: '2023-12-10', type: 'ownership', description: 'Property ownership transferred' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatArea = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'inspection': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'violation': return <Activity className="h-4 w-4 text-orange-600" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-green-600" />;
      case 'ownership': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Building Information Section */}
      <div>
        <h3 className="text-xl font-bold text-[#004b87] mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Building Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Location Details</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{building.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Borough</p>
                    <p className="font-medium">{building.borough}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ZIP Code</p>
                    <p className="font-medium">{building.zip_code}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Neighborhood</p>
                  <p className="font-medium">{building.neighborhood || 'Not specified'}</p>
                </div>
                <button
                  onClick={() => setShowMapModal(true)}
                  className="mt-2 w-full px-3 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors flex items-center justify-center space-x-2"
                >
                  <Map className="h-4 w-4" />
                  <span>View on Map</span>
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Building Specifications</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="font-medium">{building.year_built}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Building Age</p>
                  <p className="font-medium">{new Date().getFullYear() - building.year_built} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floors Above</p>
                  <p className="font-medium">{building.floors_above_grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floors Below</p>
                  <p className="font-medium">{building.floors_below_grade || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Units</p>
                  <p className="font-medium">{building.total_units || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Building Class</p>
                  <p className="font-medium">{building.building_class || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Building Type</p>
                  <p className="font-medium">{building.building_type || 'Commercial'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BIN Number</p>
                  <p className="font-medium">{building.bin_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Property Details */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Property Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Estimated Property Value</p>
                  <p className="text-2xl font-bold text-[#ff6319]">
                    {building.property_value ? formatCurrency(building.property_value) : 'N/A'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lot Area</p>
                    <p className="font-medium">{building.lot_area ? `${formatArea(building.lot_area)} sq ft` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Building Area</p>
                    <p className="font-medium">{building.building_area ? `${formatArea(building.building_area)} sq ft` : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Sq Ft</p>
                  <p className="font-medium">
                    {building.property_value && building.building_area 
                      ? formatCurrency(building.property_value / building.building_area)
                      : 'N/A'}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">Last Inspection</p>
                  <p className="font-medium">{building.last_inspection_date || 'No data'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Inspection Due</p>
                  <p className="font-medium text-orange-600">{building.next_inspection_date || 'To be scheduled'}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Updates</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{update.description}</p>
                      <p className="text-xs text-gray-500">{update.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership Information Section */}
      <div>
        <h3 className="text-xl font-bold text-[#004b87] mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Ownership & Management
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Current Ownership</h4>
            <div className="space-y-3">
              <div className="border-l-4 border-[#ff6319] pl-3">
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-medium text-lg">{building.owner_name || 'Not Available'}</p>
                {building.owner_contact && (
                  <div className="flex items-center space-x-4 mt-2">
                    <a href={`tel:${building.owner_contact}`} className="flex items-center space-x-1 text-[#004b87] hover:underline">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{building.owner_contact}</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="border-l-4 border-[#004b87] pl-3">
                <p className="text-sm text-gray-600">Property Manager</p>
                <p className="font-medium">{building.property_manager || 'Not Available'}</p>
                {building.property_manager_contact && (
                  <div className="flex items-center space-x-4 mt-2">
                    <a href={`tel:${building.property_manager_contact}`} className="flex items-center space-x-1 text-[#004b87] hover:underline">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{building.property_manager_contact}</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="border-l-4 border-gray-400 pl-3">
                <p className="text-sm text-gray-600">Management Company</p>
                <p className="font-medium">{building.management_company || 'Not Available'}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Ownership History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ownershipHistory.map((record, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div>
                    <p className="font-medium text-sm">{record.owner}</p>
                    <p className="text-xs text-gray-500">{record.year} {index === 0 && '(Current)'}</p>
                  </div>
                  <p className="font-semibold text-sm text-[#ff6319]">
                    {formatCurrency(record.price)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">
                Property value has increased {((ownershipHistory[0].price - ownershipHistory[ownershipHistory.length - 1].price) / ownershipHistory[ownershipHistory.length - 1].price * 100).toFixed(1)}% since {ownershipHistory[ownershipHistory.length - 1].year}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Building Photos Section */}
      <div>
        <h3 className="text-xl font-bold text-[#004b87] mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Building Photos
          </div>
          <button className="text-sm px-3 py-1 border border-[#004b87] text-[#004b87] rounded-md hover:bg-[#004b87] hover:text-white transition-colors flex items-center space-x-1">
            <Plus className="h-3 w-3" />
            <span>Add Photo</span>
          </button>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="relative group cursor-pointer"
              onClick={() => {
                setSelectedPhotoIndex(index);
                setShowPhotoModal(true);
              }}
            >
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-2 text-xs text-gray-600 truncate">{photo.caption}</p>
              <p className="text-xs text-gray-400">{photo.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-[#004b87] mb-2 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Building Certifications
          </h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Energy Star Certified</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>LEED Silver</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Fire Safety (Pending)</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 bg-orange-50">
          <h4 className="font-semibold text-[#ff6319] mb-2 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Market Activity
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Similar Buildings Sold</span>
              <span className="font-semibold">3 in last 6 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Price/Sq Ft (Area)</span>
              <span className="font-semibold">$1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Market Trend</span>
              <span className="font-semibold text-green-600">↑ 5.2%</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-700 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Opportunity Indicators
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Modernization Due</span>
              <span className="font-semibold text-orange-600">Yes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Owner Interest</span>
              <span className="font-semibold text-green-600">High</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Funding Available</span>
              <span className="font-semibold">Likely</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Building Location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map integration would go here</p>
                  <p className="text-sm text-gray-400 mt-2">{building.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <Camera className="h-24 w-24 text-gray-600" />
              </div>
              <div className="p-4 bg-white">
                <p className="font-medium">{photos[selectedPhotoIndex].caption}</p>
                <p className="text-sm text-gray-500">{photos[selectedPhotoIndex].date}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;