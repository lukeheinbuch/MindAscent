import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CustomSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  emoji?: string[]; // deprecated visual indicator, accepted but ignored
  icons?: string[]; // deprecated visual indicator, accepted but ignored
  showTooltip?: boolean;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  emoji = [],
  icons = [],
  showTooltip = false,
  color = 'red',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const prevUserSelect = useRef<string | null>(null);

  const colorClasses = {
    red: {
      gradient: 'from-red-500 to-red-600',
      ring: 'ring-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-600/15 border-red-500/30',
      tooltip: 'bg-red-600',
      tickActive: 'bg-red-500',
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      ring: 'ring-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-600/15 border-blue-500/30',
      tooltip: 'bg-blue-600',
      tickActive: 'bg-blue-500',
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      ring: 'ring-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-600/15 border-green-500/30',
      tooltip: 'bg-green-600',
      tickActive: 'bg-green-500',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      ring: 'ring-purple-500/30',
      text: 'text-purple-400',
      badge: 'bg-purple-600/15 border-purple-500/30',
      tooltip: 'bg-purple-600',
      tickActive: 'bg-purple-500',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      ring: 'ring-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-600/15 border-orange-500/30',
      tooltip: 'bg-orange-600',
      tickActive: 'bg-orange-500',
    },
  } as const;

  const colors = colorClasses[color];

  const updateValue = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percentage * (max - min));
    
    onChange(Math.max(min, Math.min(max, newValue)));
  }, [min, max, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setShowValue(true);
    // Disable text selection while dragging
    prevUserSelect.current = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    updateValue(e);
  }, [updateValue]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setShowValue(true);
    prevUserSelect.current = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    updateValue(e);
  }, [updateValue]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e as any);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        updateValue(e as any);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setTimeout(() => setShowValue(false), 1000);
      // Restore text selection
      if (prevUserSelect.current !== null) {
        document.body.style.userSelect = prevUserSelect.current;
        prevUserSelect.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateValue]);

  const percentage = ((value - min) / (max - min)) * 100;
  // Deprecated visual indicators intentionally removed from UI for a cleaner experience.

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
  <div className="flex items-center justify-between select-none">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${colors.badge} ${colors.text}`}>
          {value}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 rounded-full cursor-pointer bg-gray-800/80 border border-white/10 backdrop-blur-sm select-none touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Progress Track */}
          <motion.div
            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${colors.gradient} shadow-[0_8px_24px_rgba(0,0,0,0.25)]`}
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Thumb */}
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing ring-2 ${colors.ring}`}
            style={{ left: `${percentage}%` }}
            initial={false}
            animate={{ left: `${percentage}%`, scale: isDragging ? 1.12 : 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Centered thumb; simplified, no inner marker or tooltip */}
          </motion.div>
        </div>
        {/* Min/Max markers */}
        <div className="flex justify-between mt-2 px-0.5 text-[11px] text-gray-500 select-none">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomSlider;
