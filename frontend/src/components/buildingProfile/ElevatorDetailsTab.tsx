import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Info,
  Settings,
  Gauge,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';

interface Elevator {
  id: string;
  device_number: string;
  device_type: string;
  manufacturer: string;
  model?: string;
  year_installed: number;
  last_modernization?: number;
  capacity: number;
  speed?: number;
  floors_served: string;
  status: 'Operational' | 'Needs Maintenance' | 'Critical' | 'Out of Service';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  last_inspection_date: string;
  next_inspection_date: string;
  compliance_status: 'Compliant' | 'Non-Compliant' | 'Pending';
  maintenance_contract?: string;
  estimated_modernization_cost?: number;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Routine' | 'Emergency' | 'Inspection' | 'Repair' | 'Modernization';
  description: string;
  technician: string;
  cost?: number;
  status: 'Completed' | 'Scheduled' | 'In Progress';
}

interface ElevatorDetailsTabProps {
  buildingId: string;
}

const ElevatorDetailsTab: React.FC<ElevatorDetailsTabProps> = ({ buildingId }) => {
  const [elevators, setElevators] = useState<Elevator[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [selectedElevator, setSelectedElevator] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [sortBy, setSortBy] = useState<'device' | 'age' | 'condition'>('device');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Simulate fetching elevator data
    setTimeout(() => {
      const mockElevators: Elevator[] = [
        {
          id: '1',
          device_number: 'EL-001',
          device_type: 'Passenger',
          manufacturer: 'Otis',
          model: 'Gen2',
          year_installed: 2005,
          last_modernization: 2015,
          capacity: 3000,
          speed: 500,
          floors_served: '1-20',
          status: 'Operational',
          condition: 'Good',
          last_inspection_date: '2024-03-15',
          next_inspection_date: '2025-03-15',
          compliance_status: 'Compliant',
          maintenance_contract: 'Otis Service',
          estimated_modernization_cost: 250000
        },
        {
          id: '2',
          device_number: 'EL-002',
          device_type: 'Passenger',
          manufacturer: 'KONE',
          model: 'MonoSpace 500',
          year_installed: 2008,
          capacity: 3500,
          speed: 600,
          floors_served: '1-20',
          status: 'Needs Maintenance',
          condition: 'Fair',
          last_inspection_date: '2024-03-15',
          next_inspection_date: '2025-03-15',
          compliance_status: 'Pending',
          maintenance_contract: 'Building Services Inc',
          estimated_modernization_cost: 280000
        },
        {
          id: '3',
          device_number: 'EL-003',
          device_type: 'Freight',
          manufacturer: 'Schindler',
          model: '5500',
          year_installed: 1998,
          last_modernization: 2010,
          capacity: 5000,
          speed: 350,
          floors_served: 'B2-15',
          status: 'Critical',
          condition: 'Poor',
          last_inspection_date: '2024-02-28',
          next_inspection_date: '2024-08-28',
          compliance_status: 'Non-Compliant',
          estimated_modernization_cost: 350000
        },
        {
          id: '4',
          device_number: 'EL-004',
          device_type: 'Passenger',
          manufacturer: 'ThyssenKrupp',
          model: 'Evolution',
          year_installed: 2012,
          capacity: 3000,
          speed: 700,
          floors_served: '1-25',
          status: 'Operational',
          condition: 'Excellent',
          last_inspection_date: '2024-03-15',
          next_inspection_date: '2025-03-15',
          compliance_status: 'Compliant',
          maintenance_contract: 'ThyssenKrupp Service',
          estimated_modernization_cost: 200000
        }
      ];

      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: '1',
          date: '2024-03-15',
          type: 'Inspection',
          description: 'Annual safety inspection completed',
          technician: 'John Smith',
          cost: 1500,
          status: 'Completed'
        },
        {
          id: '2',
          date: '2024-04-01',
          type: 'Routine',
          description: 'Quarterly maintenance scheduled',
          technician: 'TBD',
          cost: 800,
          status: 'Scheduled'
        },
        {
          id: '3',
          date: '2024-02-10',
          type: 'Emergency',
          description: 'Emergency brake repair - EL-003',
          technician: 'Mike Johnson',
          cost: 5000,
          status: 'Completed'
        },
        {
          id: '4',
          date: '2024-01-15',
          type: 'Routine',
          description: 'Monthly lubrication and adjustment',
          technician: 'Sarah Davis',
          cost: 600,
          status: 'Completed'
        }
      ];

      setElevators(mockElevators);
      setMaintenanceHistory(mockMaintenance);
      setLoading(false);
    }, 500);
  }, [buildingId]);

  const getStatusBadge = (status: string) => {
    const badges = {
      'Operational': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Needs Maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'Out of Service': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
    };
    return badges[status as keyof typeof badges] || badges['Operational'];
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      'Excellent': 'text-green-600',
      'Good': 'text-blue-600',
      'Fair': 'text-yellow-600',
      'Poor': 'text-red-600'
    };
    return colors[condition as keyof typeof colors] || 'text-gray-600';
  };

  const getComplianceColor = (compliance: string) => {
    const colors = {
      'Compliant': 'text-green-600',
      'Non-Compliant': 'text-red-600',
      'Pending': 'text-yellow-600'
    };
    return colors[compliance as keyof typeof colors] || 'text-gray-600';
  };

  const calculateAge = (yearInstalled: number, lastModernization?: number) => {
    const currentYear = new Date().getFullYear();
    const referenceYear = lastModernization || yearInstalled;
    return currentYear - referenceYear;
  };

  const getTotalModernizationCost = () => {
    return elevators.reduce((sum, elevator) => sum + (elevator.estimated_modernization_cost || 0), 0);
  };

  const sortedElevators = [...elevators].sort((a, b) => {
    if (sortBy === 'age') {
      return calculateAge(b.year_installed, b.last_modernization) - calculateAge(a.year_installed, a.last_modernization);
    } else if (sortBy === 'condition') {
      const conditionOrder = { 'Poor': 0, 'Fair': 1, 'Good': 2, 'Excellent': 3 };
      return (conditionOrder[a.condition as keyof typeof conditionOrder] || 0) - 
             (conditionOrder[b.condition as keyof typeof conditionOrder] || 0);
    }
    return a.device_number.localeCompare(b.device_number);
  });

  const filteredElevators = filterStatus === 'all' 
    ? sortedElevators 
    : sortedElevators.filter(e => e.status === filterStatus);

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case 'Inspection': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'Emergency': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Routine': return <Wrench className="h-4 w-4 text-green-600" />;
      case 'Repair': return <Wrench className="h-4 w-4 text-orange-600" />;
      case 'Modernization': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004b87] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elevator details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Elevators</p>
              <p className="text-2xl font-bold text-blue-900">{elevators.length}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Operational</p>
              <p className="text-2xl font-bold text-green-900">
                {elevators.filter(e => e.status === 'Operational').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Need Attention</p>
              <p className="text-2xl font-bold text-orange-900">
                {elevators.filter(e => e.status !== 'Operational').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Total Est. Cost</p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(getTotalModernizationCost())}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
              >
                <option value="all">All Status</option>
                <option value="Operational">Operational</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Critical">Critical</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87]"
              >
                <option value="device">Device Number</option>
                <option value="age">Age Since Modernization</option>
                <option value="condition">Condition</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="px-4 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors flex items-center space-x-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Cost Analysis</span>
          </button>
        </div>
      </div>

      {/* Elevator Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#004b87] text-white">
          <h3 className="text-lg font-semibold flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Elevator Inventory
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer/Model
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floors
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredElevators.map((elevator) => {
                const statusBadge = getStatusBadge(elevator.status);
                const StatusIcon = statusBadge.icon;
                const age = calculateAge(elevator.year_installed, elevator.last_modernization);
                
                return (
                  <tr 
                    key={elevator.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedElevator(selectedElevator === elevator.id ? null : elevator.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{elevator.device_number}</div>
                        <div className="text-xs text-gray-500">{elevator.device_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{elevator.manufacturer}</div>
                        {elevator.model && (
                          <div className="text-xs text-gray-500">{elevator.model}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{age} years</div>
                        <div className="text-xs text-gray-500">
                          {elevator.last_modernization ? `Mod. ${elevator.last_modernization}` : `Inst. ${elevator.year_installed}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{elevator.capacity} lbs</div>
                      {elevator.speed && (
                        <div className="text-xs text-gray-500">{elevator.speed} fpm</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{elevator.floors_served}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-medium ${getConditionColor(elevator.condition)}`}>
                        {elevator.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {elevator.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-medium ${getComplianceColor(elevator.compliance_status)}`}>
                        {elevator.compliance_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {elevator.estimated_modernization_cost ? formatCurrency(elevator.estimated_modernization_cost) : 'TBD'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Elevator Details */}
      {selectedElevator && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#004b87] flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Detailed Information - {elevators.find(e => e.id === selectedElevator)?.device_number}
            </h4>
            <button
              onClick={() => setSelectedElevator(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Maintenance Contract</p>
              <p className="font-medium">{elevators.find(e => e.id === selectedElevator)?.maintenance_contract || 'None'}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Inspection</p>
              <p className="font-medium">{elevators.find(e => e.id === selectedElevator)?.last_inspection_date}</p>
            </div>
            <div>
              <p className="text-gray-600">Next Inspection</p>
              <p className="font-medium text-orange-600">{elevators.find(e => e.id === selectedElevator)?.next_inspection_date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance History Timeline */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-[#004b87] flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Maintenance History
            </div>
            <button className="text-sm px-3 py-1 border border-[#004b87] text-[#004b87] rounded-md hover:bg-[#004b87] hover:text-white transition-colors">
              View Full History
            </button>
          </h3>
        </div>
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-4">
              {maintenanceHistory.map((record, index) => (
                <div key={record.id} className="relative flex items-start">
                  <div className="absolute left-8 w-0.5 h-full bg-gray-200"></div>
                  <div className="relative z-10 flex items-center justify-center w-16">
                    <div className="bg-white p-2 rounded-full border-2 border-gray-200">
                      {getMaintenanceIcon(record.type)}
                    </div>
                  </div>
                  <div className="flex-1 ml-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{record.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{record.date}</span>
                          <span>•</span>
                          <span>{record.technician}</span>
                          {record.cost && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{formatCurrency(record.cost)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Age Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Equipment Age Analysis
          </h3>
          <div className="space-y-4">
            {elevators.map((elevator) => {
              const age = calculateAge(elevator.year_installed, elevator.last_modernization);
              const agePercentage = Math.min((age / 30) * 100, 100);
              const ageColor = age > 20 ? 'bg-red-500' : age > 10 ? 'bg-yellow-500' : 'bg-green-500';
              
              return (
                <div key={elevator.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{elevator.device_number}</span>
                    <span className="text-sm text-gray-500">{age} years</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${ageColor} transition-all duration-300`}
                      style={{ width: `${agePercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average Equipment Age</span>
              <span className="font-semibold text-gray-900">
                {Math.round(elevators.reduce((sum, e) => sum + calculateAge(e.year_installed, e.last_modernization), 0) / elevators.length)} years
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Inspections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Inspections
          </h3>
          <div className="space-y-3">
            {elevators
              .sort((a, b) => new Date(a.next_inspection_date).getTime() - new Date(b.next_inspection_date).getTime())
              .map((elevator) => {
                const daysUntil = Math.floor((new Date(elevator.next_inspection_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const urgencyColor = daysUntil < 30 ? 'text-red-600' : daysUntil < 90 ? 'text-yellow-600' : 'text-green-600';
                
                return (
                  <div key={elevator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className={`h-4 w-4 ${urgencyColor}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{elevator.device_number}</p>
                        <p className="text-xs text-gray-500">{elevator.next_inspection_date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${urgencyColor}`}>
                      {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Modal */}
      {showCostBreakdown && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#004b87] mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Modernization Cost Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cost by Elevator</h4>
              <div className="space-y-2">
                {elevators.map((elevator) => (
                  <div key={elevator.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{elevator.device_number}</span>
                    <span className="text-sm font-semibold text-[#ff6319]">
                      {elevator.estimated_modernization_cost ? formatCurrency(elevator.estimated_modernization_cost) : 'TBD'}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Project Cost</span>
                    <span className="text-lg font-bold text-[#004b87]">
                      {formatCurrency(getTotalModernizationCost())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Financial Benefits</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Energy Savings (Annual)</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">$45,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowDownRight className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Reduced Maintenance</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">$28,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Property Value Increase</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">$2.5M</span>
                </div>
                <div className="pt-3 mt-3 border-t bg-green-50 -mx-3 px-3 py-2 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Estimated ROI</span>
                    <span className="text-lg font-bold text-green-600">18.5%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">Payback Period</span>
                    <span className="text-sm font-semibold">5.4 years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElevatorDetailsTab;