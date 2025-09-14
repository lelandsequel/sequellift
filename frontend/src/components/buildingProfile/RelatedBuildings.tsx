import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  TrendingUp,
  ChevronRight,
  Users,
  Target,
  AlertTriangle
} from 'lucide-react';

interface RelatedBuilding {
  id: string;
  bin_number: string;
  address: string;
  borough: string;
  opportunity_score: number;
  priority_level: string;
  total_violations: number;
  elevator_count: number;
  relationship_type: 'same_owner' | 'nearby' | 'similar_score';
}

interface RelatedBuildingsProps {
  currentBuildingId: string;
  owner?: string;
  borough: string;
  score: number;
}

const RelatedBuildings: React.FC<RelatedBuildingsProps> = ({
  currentBuildingId,
  owner,
  borough,
  score
}) => {
  const [relatedBuildings, setRelatedBuildings] = useState<RelatedBuilding[]>([]);
  const [activeTab, setActiveTab] = useState<'owner' | 'nearby' | 'similar'>('owner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching related buildings
    setTimeout(() => {
      const mockRelated: RelatedBuilding[] = [
        // Same owner buildings
        {
          id: '101',
          bin_number: 'BIN-101',
          address: '456 Broadway',
          borough: 'Manhattan',
          opportunity_score: 82,
          priority_level: 'High',
          total_violations: 5,
          elevator_count: 4,
          relationship_type: 'same_owner'
        },
        {
          id: '102',
          bin_number: 'BIN-102',
          address: '789 5th Avenue',
          borough: 'Manhattan',
          opportunity_score: 75,
          priority_level: 'High',
          total_violations: 3,
          elevator_count: 6,
          relationship_type: 'same_owner'
        },
        // Nearby buildings
        {
          id: '201',
          bin_number: 'BIN-201',
          address: '123 Next Street',
          borough,
          opportunity_score: 88,
          priority_level: 'Critical',
          total_violations: 8,
          elevator_count: 3,
          relationship_type: 'nearby'
        },
        {
          id: '202',
          bin_number: 'BIN-202',
          address: '456 Adjacent Ave',
          borough,
          opportunity_score: 71,
          priority_level: 'Medium',
          total_violations: 2,
          elevator_count: 2,
          relationship_type: 'nearby'
        },
        {
          id: '203',
          bin_number: 'BIN-203',
          address: '789 Corner Plaza',
          borough,
          opportunity_score: 79,
          priority_level: 'High',
          total_violations: 4,
          elevator_count: 5,
          relationship_type: 'nearby'
        },
        // Similar score buildings
        {
          id: '301',
          bin_number: 'BIN-301',
          address: '321 Similar Tower',
          borough: 'Brooklyn',
          opportunity_score: score + 2,
          priority_level: 'High',
          total_violations: 6,
          elevator_count: 4,
          relationship_type: 'similar_score'
        },
        {
          id: '302',
          bin_number: 'BIN-302',
          address: '654 Match Building',
          borough: 'Queens',
          opportunity_score: score - 1,
          priority_level: 'High',
          total_violations: 5,
          elevator_count: 3,
          relationship_type: 'similar_score'
        }
      ];

      setRelatedBuildings(mockRelated);
      setLoading(false);
    }, 300);
  }, [currentBuildingId, owner, borough, score]);

  const getFilteredBuildings = () => {
    if (activeTab === 'owner') {
      return relatedBuildings.filter(b => b.relationship_type === 'same_owner');
    } else if (activeTab === 'nearby') {
      return relatedBuildings.filter(b => b.relationship_type === 'nearby');
    } else {
      return relatedBuildings.filter(b => b.relationship_type === 'similar_score');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-red-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.Low;
  };

  const filteredBuildings = getFilteredBuildings();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-[#004b87] mb-4">Related Buildings</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-[#004b87] flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Related Buildings
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('owner')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'owner'
              ? 'bg-gray-50 text-[#004b87] border-b-2 border-[#004b87]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-1" />
          Same Owner ({relatedBuildings.filter(b => b.relationship_type === 'same_owner').length})
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'nearby'
              ? 'bg-gray-50 text-[#004b87] border-b-2 border-[#004b87]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-1" />
          Nearby ({relatedBuildings.filter(b => b.relationship_type === 'nearby').length})
        </button>
        <button
          onClick={() => setActiveTab('similar')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'similar'
              ? 'bg-gray-50 text-[#004b87] border-b-2 border-[#004b87]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-1" />
          Similar ({relatedBuildings.filter(b => b.relationship_type === 'similar_score').length})
        </button>
      </div>

      {/* Building List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredBuildings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No {activeTab === 'owner' ? 'buildings with same owner' : activeTab === 'nearby' ? 'nearby buildings' : 'similar buildings'} found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBuildings.map((building) => (
              <Link
                key={building.id}
                to={`/building/${building.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {building.address}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(building.priority_level)}`}>
                        {building.priority_level}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{building.borough}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span>{building.elevator_count} elevators</span>
                      </span>
                      {building.total_violations > 0 && (
                        <span className="flex items-center space-x-1 text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{building.total_violations} violations</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className={`text-lg font-bold ${getScoreColor(building.opportunity_score)}`}>
                        {building.opportunity_score}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {activeTab === 'owner' && filteredBuildings.length > 0 && (
        <div className="p-4 bg-blue-50 border-t">
          <button className="w-full px-4 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors flex items-center justify-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Create Portfolio Proposal</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            Combine all {filteredBuildings.length} buildings for a comprehensive modernization plan
          </p>
        </div>
      )}

      {activeTab === 'nearby' && filteredBuildings.length > 0 && (
        <div className="p-4 bg-green-50 border-t">
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>View Area Map</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            Explore all opportunities in this neighborhood
          </p>
        </div>
      )}

      {activeTab === 'similar' && filteredBuildings.length > 0 && (
        <div className="p-4 bg-orange-50 border-t">
          <button className="w-full px-4 py-2 bg-[#ff6319] text-white rounded-md hover:bg-[#e5541a] transition-colors flex items-center justify-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Compare Buildings</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            Analyze similarities and differences
          </p>
        </div>
      )}
    </div>
  );
};

export default RelatedBuildings;