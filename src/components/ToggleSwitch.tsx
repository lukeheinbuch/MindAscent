import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  value,
  onChange,
  description,
  color = 'red',
  className = '',
}) => {
  const colorClasses = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-lg font-medium text-gray-100">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            value ? colorClasses[color] : 'bg-gray-600'
          } focus:ring-${color}-500`}
        >
          <motion.span
            layout
            className="inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200"
            animate={{
              x: value ? 24 : 4,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
};

export default ToggleSwitch;
