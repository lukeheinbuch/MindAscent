import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedControlProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  label,
  options,
  value,
  onChange,
  color = 'red',
  className = '',
}) => {
  const colorClasses = {
    red: 'bg-red-600 text-white',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-600 text-white',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-lg font-medium text-gray-100">
        {label}
      </label>
      
      <div className="bg-gray-700 rounded-lg p-1 flex">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              value === option.value
                ? colorClasses[color]
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {value === option.value && (
              <motion.div
                layoutId="segmented-bg"
                className={`absolute inset-0 rounded-md ${colorClasses[color]}`}
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentedControl;
