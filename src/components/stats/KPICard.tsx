import React from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'red',
  size = 'md'
}) => {
  const colorClasses = {
    red: 'border-red-600 bg-red-600/10',
    green: 'border-green-600 bg-green-600/10',
    blue: 'border-blue-600 bg-blue-600/10',
    yellow: 'border-yellow-600 bg-yellow-600/10',
    purple: 'border-purple-600 bg-purple-600/10',
    gray: 'border-gray-600 bg-gray-600/10'
  };

  const iconColorClasses = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400'
  };

  const trendColorClasses = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const getTrendSymbol = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-gray-800 rounded-xl border ${colorClasses[color]} 
        ${sizeClasses[size]} transition-all duration-200
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {icon && (
          <div className={`${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className={`${valueSizeClasses[size]} font-bold text-white`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
      </div>

      {/* Subtitle and Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-sm text-gray-400">{subtitle}</span>
        )}
        
        {trend && (
          <div className={`flex items-center space-x-1 ${trendColorClasses[trend.direction]}`}>
            <span className="text-lg">{getTrendSymbol()}</span>
            <span className="text-sm font-medium">
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-500">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;
