import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  emojis?: string[];
  color?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  emojis = ['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'],
  color = 'primary-500'
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(event.target.value));
  };

  const currentEmoji = emojis[value - 1] || emojis[2];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="text-lg font-medium text-gray-100">
          {label}
        </label>
        <div className="flex items-center space-x-3">
          <motion.span 
            className="text-2xl"
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {currentEmoji}
          </motion.span>
          <span className="text-xl font-bold text-white bg-dark-400 px-3 py-1 rounded-lg">
            {value}
          </span>
        </div>
      </div>

      {/* Custom Slider */}
      <div className="relative">
        {/* Track */}
        <div className="h-3 bg-dark-200 rounded-full relative overflow-hidden">
          {/* Progress */}
          <motion.div
            className={`h-full bg-${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Hidden Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <motion.div
          className={`absolute top-1/2 w-6 h-6 bg-white border-2 border-${color} rounded-full transform -translate-y-1/2 shadow-lg cursor-pointer`}
          style={{ left: `calc(${percentage}% - 12px)` }}
          animate={{ 
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging ? `0 0 20px rgba(239, 68, 68, 0.5)` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-sm text-gray-400 px-1">
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <span key={i} className="text-center">
            {min + i}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Slider;
