import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, BarChart3, Home, FileSearch, Search, Map, FileText } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/buildings', label: 'Buildings', icon: Building2 },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/opportunities', label: 'Opportunities', icon: FileSearch },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText }
  ];

  return (
    <nav className="bg-[#004b87] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-[#ff6319]" />
            <div>
              <h1 className="text-xl font-bold">NYC Elevator Modernization</h1>
              <p className="text-xs text-gray-300">Opportunity Finder</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
                    ${isActive 
                      ? 'bg-[#ff6319] text-white' 
                      : 'hover:bg-[#003a6c] text-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;