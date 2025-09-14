import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'gray';
  trend?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    red: 'text-red-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
        {trend && (
          <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;