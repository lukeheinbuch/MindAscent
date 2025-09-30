import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  label?: string;
}

interface HeatmapProps {
  data: HeatmapCell[];
  title: string;
  xLabels: string[];
  yLabels: string[];
  colorScale?: [string, string]; // [min color, max color]
  height?: number;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
}

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  title,
  xLabels,
  yLabels,
  colorScale = ['#1F2937', '#EF4444'],
  height = 300,
  showValues = true,
  valueFormat = (value) => value.toFixed(1)
}) => {
  // Calculate min and max values for color scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  // Function to interpolate between two colors
  const interpolateColor = (value: number) => {
    if (range === 0) return colorScale[0];
    
    const normalized = (value - minValue) / range;
    const clamped = Math.max(0, Math.min(1, normalized));
    
    // Simple RGB interpolation
    const startColor = hexToRgb(colorScale[0]);
    const endColor = hexToRgb(colorScale[1]);
    
    if (!startColor || !endColor) return colorScale[0];
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * clamped);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * clamped);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * clamped);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to convert hex to RGB
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Create a matrix for easier access
  const matrix = React.useMemo(() => {
    const result: { [key: string]: number } = {};
    data.forEach(cell => {
      result[`${cell.x}-${cell.y}`] = cell.value;
    });
    return result;
  }, [data]);

  const cellWidth = Math.max(60, (height - 100) / yLabels.length);
  const cellHeight = cellWidth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="overflow-auto">
        <div className="relative" style={{ minWidth: xLabels.length * cellWidth + 80 }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-8" style={{ width: 80 }}>
            {yLabels.map((label, i) => (
              <div
                key={label}
                className="text-sm text-gray-400 text-right pr-2 flex items-center justify-end"
                style={{ 
                  height: cellHeight,
                  lineHeight: `${cellHeight}px`
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="ml-20">
            {/* X-axis labels */}
            <div className="flex mb-2" style={{ height: 30 }}>
              {xLabels.map((label, i) => (
                <div
                  key={label}
                  className="text-sm text-gray-400 text-center flex items-end justify-center"
                  style={{ 
                    width: cellWidth,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'bottom center'
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div>
              {yLabels.map((yLabel, yIndex) => (
                <div key={yLabel} className="flex">
                  {xLabels.map((xLabel, xIndex) => {
                    const value = matrix[`${xLabel}-${yLabel}`];
                    const hasValue = value !== undefined;
                    
                    return (
                      <motion.div
                        key={`${xLabel}-${yLabel}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (yIndex * xLabels.length + xIndex) * 0.02 }}
                        className="border border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
                        style={{
                          width: cellWidth,
                          height: cellHeight,
                          backgroundColor: hasValue ? interpolateColor(value) : '#374151'
                        }}
                        title={hasValue ? `${xLabel} × ${yLabel}: ${valueFormat(value)}` : 'No data'}
                      >
                        {hasValue && showValues && (
                          <span 
                            className="text-xs font-medium"
                            style={{ 
                              color: value > (minValue + range * 0.5) ? '#FFFFFF' : '#000000'
                            }}
                          >
                            {valueFormat(value)}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Color legend */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <span className="text-xs text-gray-400">Low</span>
            <div className="flex rounded overflow-hidden" style={{ width: 200, height: 20 }}>
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 20,
                    backgroundColor: interpolateColor(minValue + (range * i / 19))
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">High</span>
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-gray-500" style={{ width: 200, margin: '0 auto' }}>
            <span>{valueFormat(minValue)}</span>
            <span>{valueFormat(maxValue)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Heatmap;
