import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, FeatureGroup, Circle, Rectangle, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from 'react-leaflet-cluster';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Search, Filter, Layers, Download, Printer, Expand, X, ChevronLeft, ChevronRight, Building2, AlertTriangle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildingsAPI } from '../services/api';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Define types
interface Building {
  id: string;
  address: string;
  borough: string;
  zip_code: string;
  year_built: number;
  floors: number;
  elevators_count: number;
  violations_count: number;
  opportunity_score: number;
  priority_level: string;
  building_name?: string;
  lat?: number;
  lng?: number;
}

interface MapFilters {
  boroughs: string[];
  minScore: number;
  maxScore: number;
  minViolations: number;
  maxViolations: number;
  minYear: number;
  maxYear: number;
}

interface Territory {
  id: string;
  name: string;
  coordinates: LatLng[];
  stats?: {
    buildingCount: number;
    avgScore: number;
    totalViolations: number;
  };
}

// Borough boundaries (simplified polygons)
const BOROUGH_BOUNDARIES = {
  Manhattan: {
    center: [40.7831, -73.9712] as [number, number],
    bounds: [[40.6980, -74.0190], [40.8820, -73.9067]] as [[number, number], [number, number]]
  },
  Brooklyn: {
    center: [40.6782, -73.9442] as [number, number],
    bounds: [[40.5707, -74.0419], [40.7394, -73.8333]] as [[number, number], [number, number]]
  },
  Queens: {
    center: [40.7282, -73.7949] as [number, number],
    bounds: [[40.5431, -73.9626], [40.8007, -73.7004]] as [[number, number], [number, number]]
  },
  Bronx: {
    center: [40.8448, -73.8648] as [number, number],
    bounds: [[40.7855, -73.9333], [40.9176, -73.7654]] as [[number, number], [number, number]]
  },
  'Staten Island': {
    center: [40.5795, -74.1502] as [number, number],
    bounds: [[40.4774, -74.2591], [40.6490, -74.0351]] as [[number, number], [number, number]]
  }
};

// Helper function to generate coordinates based on borough and address
const generateCoordinates = (borough: string, address: string): [number, number] => {
  const boroughData = BOROUGH_BOUNDARIES[borough as keyof typeof BOROUGH_BOUNDARIES];
  if (!boroughData) return [40.7128, -74.0060]; // Default NYC center
  
  // Generate pseudo-random coordinates within borough bounds
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latRange = boroughData.bounds[1][0] - boroughData.bounds[0][0];
  const lngRange = boroughData.bounds[1][1] - boroughData.bounds[0][1];
  
  const lat = boroughData.bounds[0][0] + (hash % 100) / 100 * latRange;
  const lng = boroughData.bounds[0][1] + ((hash * 3) % 100) / 100 * lngRange;
  
  return [lat, lng];
};

// Create custom icon based on score
const createMarkerIcon = (score: number, size: 'small' | 'medium' | 'large' = 'medium') => {
  let color: string;
  if (score >= 85) color = '#dc2626'; // red
  else if (score >= 65) color = '#f97316'; // orange
  else if (score >= 40) color = '#eab308'; // yellow
  else color = '#22c55e'; // green
  
  const sizes = {
    small: 20,
    medium: 25,
    large: 30
  };
  
  const iconSize = sizes[size];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: ${iconSize}px;
        height: ${iconSize}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize / 2]
  });
};

// Map controls component
const MapControls: React.FC<{ map: L.Map | null }> = ({ map }) => {
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleReset = () => map?.setView([40.7128, -74.0060], 11);
  const handleFullscreen = () => {
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer) {
      if (!document.fullscreenElement) {
        mapContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="bg-white p-2 rounded shadow hover:bg-gray-100"
        title="Zoom In"
      >
        <span className="text-lg font-bold">+</span>
      </button>
      <button
        onClick={handleZoomOut}
        className="bg-white p-2 rounded shadow hover:bg-gray-100"
        title="Zoom Out"
      >
        <span className="text-lg font-bold">−</span>
      </button>
      <button
        onClick={handleReset}
        className="bg-white p-2 rounded shadow hover:bg-gray-100"
        title="Reset View"
      >
        <MapPin className="w-4 h-4" />
      </button>
      <button
        onClick={handleFullscreen}
        className="bg-white p-2 rounded shadow hover:bg-gray-100"
        title="Fullscreen"
      >
        <Expand className="w-4 h-4" />
      </button>
    </div>
  );
};

// Map events handler
const MapEventHandler: React.FC<{ onBoundsChange: (bounds: L.LatLngBounds) => void }> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    }
  });
  return null;
};

// Borough overlay component
const BoroughOverlay: React.FC<{ showBoundaries: boolean }> = ({ showBoundaries }) => {
  const map = useMap();

  const handleBoroughClick = (borough: string) => {
    const data = BOROUGH_BOUNDARIES[borough as keyof typeof BOROUGH_BOUNDARIES];
    if (data) {
      map.fitBounds(data.bounds);
    }
  };

  if (!showBoundaries) return null;

  return (
    <>
      {Object.entries(BOROUGH_BOUNDARIES).map(([borough, data]) => (
        <Rectangle
          key={borough}
          bounds={data.bounds}
          pathOptions={{
            color: '#3b82f6',
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.1
          }}
          eventHandlers={{
            click: () => handleBoroughClick(borough)
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{borough}</h3>
              <p className="text-sm">Click to zoom</p>
            </div>
          </Popup>
        </Rectangle>
      ))}
    </>
  );
};

const Map: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({
    boroughs: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
    minScore: 0,
    maxScore: 100,
    minViolations: 0,
    maxViolations: 100,
    minYear: 1900,
    maxYear: 2024
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Fetch buildings data
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const response = await buildingsAPI.getBuildings({ limit: 100 });
        const buildingsData = response.data.data || response.data.buildings || [];
        const buildingsWithCoords = buildingsData.map((building: Building) => ({
          ...building,
          ...(() => {
            const coords = generateCoordinates(building.borough, building.address);
            return { lat: coords[0], lng: coords[1] };
          })()
        }));
        setBuildings(buildingsWithCoords);
        setFilteredBuildings(buildingsWithCoords);
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = buildings.filter(building => {
      if (!filters.boroughs.includes(building.borough)) return false;
      if (building.opportunity_score < filters.minScore || building.opportunity_score > filters.maxScore) return false;
      if (building.violations_count < filters.minViolations || building.violations_count > filters.maxViolations) return false;
      if (building.year_built < filters.minYear || building.year_built > filters.maxYear) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return building.address.toLowerCase().includes(query) ||
               building.building_name?.toLowerCase().includes(query) ||
               building.borough.toLowerCase().includes(query);
      }
      
      return true;
    });

    setFilteredBuildings(filtered);
  }, [filters, buildings, searchQuery]);

  // Calculate statistics for visible area
  const visibleStats = useMemo(() => {
    if (!visibleBounds || !filteredBuildings.length) {
      return { count: 0, avgScore: 0, maxScore: 0 };
    }

    const visibleBuildings = filteredBuildings.filter(building => {
      if (!building.lat || !building.lng) return false;
      return visibleBounds.contains([building.lat, building.lng]);
    });

    const count = visibleBuildings.length;
    const avgScore = count > 0 
      ? Math.round(visibleBuildings.reduce((sum, b) => sum + b.opportunity_score, 0) / count)
      : 0;
    const maxScore = count > 0
      ? Math.max(...visibleBuildings.map(b => b.opportunity_score))
      : 0;

    return { count, avgScore, maxScore };
  }, [visibleBounds, filteredBuildings]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const building = filteredBuildings.find(b => 
        b.address.toLowerCase().includes(query.toLowerCase())
      );
      if (building && building.lat && building.lng && mapRef.current) {
        mapRef.current.setView([building.lat, building.lng], 16);
      }
    }
  };

  // Export visible buildings
  const exportVisibleBuildings = () => {
    const visibleBuildings = filteredBuildings.filter(building => {
      if (!building.lat || !building.lng || !visibleBounds) return false;
      return visibleBounds.contains([building.lat, building.lng]);
    });

    const csv = [
      ['Address', 'Borough', 'Score', 'Violations', 'Elevators', 'Year Built', 'Floors'].join(','),
      ...visibleBuildings.map(b => 
        [b.address, b.borough, b.opportunity_score, b.violations_count, b.elevators_count, b.year_built, b.floors].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buildings_export.csv';
    a.click();
  };

  // Print map
  const printMap = () => {
    window.print();
  };

  // Heat map data
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return null;
    return filteredBuildings
      .filter(b => b.lat && b.lng)
      .map(b => [b.lat!, b.lng!, b.opportunity_score / 100] as [number, number, number]);
  }, [filteredBuildings, showHeatmap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={11}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onBoundsChange={setVisibleBounds} />
        <BoroughOverlay showBoundaries={showBoundaries} />
        
        {/* Drawing tools */}
        <FeatureGroup>
          <EditControl
            position="topleft"
            draw={{
              rectangle: true,
              polygon: true,
              circle: true,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
            onCreated={(e: any) => {
              const layer = e.layer;
              const coords = layer.getLatLngs ? layer.getLatLngs()[0] : [];
              const newTerritory: Territory = {
                id: Date.now().toString(),
                name: `Territory ${territories.length + 1}`,
                coordinates: coords,
                stats: {
                  buildingCount: 0,
                  avgScore: 0,
                  totalViolations: 0
                }
              };
              
              // Calculate stats for territory
              const territoryBuildings = filteredBuildings.filter(b => {
                if (!b.lat || !b.lng) return false;
                const point = L.latLng(b.lat, b.lng);
                return layer.getBounds().contains(point);
              });
              
              newTerritory.stats = {
                buildingCount: territoryBuildings.length,
                avgScore: territoryBuildings.length > 0 
                  ? Math.round(territoryBuildings.reduce((sum, b) => sum + b.opportunity_score, 0) / territoryBuildings.length)
                  : 0,
                totalViolations: territoryBuildings.reduce((sum, b) => sum + b.violations_count, 0)
              };
              
              setTerritories([...territories, newTerritory]);
              localStorage.setItem('territories', JSON.stringify([...territories, newTerritory]));
            }}
          />
        </FeatureGroup>
        
        {/* Building markers */}
        {!showHeatmap && (
          <MarkerClusterGroup chunkedLoading>
            {filteredBuildings.map((building) => {
              if (!building.lat || !building.lng) return null;
              
              const size = building.floors > 20 ? 'large' : building.floors > 10 ? 'medium' : 'small';
              
              return (
                <Marker
                  key={building.id}
                  position={[building.lat, building.lng]}
                  icon={createMarkerIcon(building.opportunity_score, size)}
                >
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <h3 className="font-bold text-lg mb-2">
                        {building.building_name || building.address}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Address:</strong> {building.address}</p>
                        <p><strong>Borough:</strong> {building.borough}</p>
                        <div className="flex items-center gap-2">
                          <strong>Score:</strong>
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 rounded-full ${
                              building.opportunity_score >= 85 ? 'bg-red-500' :
                              building.opportunity_score >= 65 ? 'bg-orange-500' :
                              building.opportunity_score >= 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <span>{building.opportunity_score}</span>
                          </div>
                        </div>
                        <p><strong>Elevators:</strong> {building.elevators_count}</p>
                        <p><strong>Violations:</strong> {building.violations_count}</p>
                        <p><strong>Year Built:</strong> {building.year_built}</p>
                        <p><strong>Floors:</strong> {building.floors}</p>
                      </div>
                      <Link
                        to={`/building/${building.id}`}
                        className="mt-3 block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}
        
        {/* Heat map layer */}
        {showHeatmap && heatmapData && (
          <div className="absolute inset-0 z-[400] pointer-events-none">
            {heatmapData.map(([lat, lng, intensity], idx) => (
              <Circle
                key={idx}
                center={[lat, lng]}
                radius={intensity * 1000}
                pathOptions={{
                  color: intensity > 0.85 ? '#dc2626' :
                         intensity > 0.65 ? '#f97316' :
                         intensity > 0.40 ? '#eab308' :
                         '#22c55e',
                  fillOpacity: 0.3,
                  opacity: 0
                }}
              />
            ))}
          </div>
        )}
        
        <MapControls map={mapRef.current} />
      </MapContainer>
      
      {/* Search bar */}
      <div className="absolute top-4 left-16 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Filter panel */}
      <div className={`absolute top-20 left-4 z-[1000] bg-white rounded-lg shadow-lg transition-all ${
        showFilters ? 'w-80' : 'w-12'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${!showFilters && 'hidden'}`}>Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {showFilters ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
          
          {showFilters && (
            <div className="space-y-4">
              {/* Borough filters */}
              <div>
                <label className="block text-sm font-medium mb-2">Boroughs</label>
                <div className="space-y-1">
                  {['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'].map(borough => (
                    <label key={borough} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.boroughs.includes(borough)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              boroughs: [...prev.boroughs, borough]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              boroughs: prev.boroughs.filter(b => b !== borough)
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{borough}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Score range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Score Range: {filters.minScore} - {filters.maxScore}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              {/* Violations range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Violations: {filters.minViolations} - {filters.maxViolations}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={filters.minViolations}
                    onChange={(e) => setFilters(prev => ({ ...prev, minViolations: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxViolations}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxViolations: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>
              </div>
              
              {/* Building age */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Year Built: {filters.minYear} - {filters.maxYear}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={filters.minYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, minYear: Number(e.target.value) }))}
                    className="w-24 px-2 py-1 border rounded"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={filters.maxYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxYear: Number(e.target.value) }))}
                    className="w-24 px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Statistics overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-bold mb-2">Visible Area Stats</h4>
        <div className="space-y-1 text-sm">
          <p><Building2 className="inline w-4 h-4 mr-1" /> Buildings: {visibleStats.count}</p>
          <p>Avg Score: {visibleStats.avgScore}</p>
          <p>Max Score: {visibleStats.maxScore}</p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-bold mb-2">Score Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm">Critical (85-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-sm">High (65-84)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Medium (40-64)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm">Low (0-39)</span>
          </div>
        </div>
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute top-4 right-20 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 rounded ${showHeatmap ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            title="Toggle Heatmap"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`px-3 py-1 rounded ${showBoundaries ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            title="Toggle Borough Boundaries"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            onClick={exportVisibleBuildings}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Export Data"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={printMap}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Print Map"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;