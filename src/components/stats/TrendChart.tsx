import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface TrendData {
  date: string;
  value: number;
  secondary?: number;
}

interface TrendChartProps {
  data: TrendData[];
  title: string;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showTrendLine?: boolean;
  height?: number;
  domain?: [number, number];
  unit?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  primaryLabel,
  secondaryLabel,
  primaryColor = '#EF4444',
  secondaryColor = '#3B82F6',
  showTrendLine = false,
  height = 300,
  domain = [0, 10],
  unit = ''
}) => {
  const [hovered, setHovered] = React.useState(false);
  // Calculate trend line if requested
  const trendData = React.useMemo(() => {
    if (!showTrendLine || data.length < 2) return [];
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((_, i) => ({
      date: data[i].date,
      trend: slope * i + intercept
    }));
  }, [data, showTrendLine]);

  const formatTooltip = (value: any, name?: string) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(1)}${unit}`, name];
    }
    return [value, name];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`rounded-xl p-6 border transition-colors ${hovered ? 'bg-gray-800/90 border-red-600/60 shadow-[0_10px_30px_rgba(239,68,68,0.25)]' : 'bg-gray-800 border-gray-700'}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={domain}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px'
              }}
              formatter={formatTooltip}
              labelStyle={{ color: '#D1D5DB' }}
            />
            
            {/* Primary line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={hovered ? '#EF4444' : primaryColor}
              strokeWidth={hovered ? 3.5 : 3}
              dot={{ fill: hovered ? '#EF4444' : primaryColor, strokeWidth: 2, r: hovered ? 5 : 4 }}
              activeDot={{ r: hovered ? 7 : 6, fill: hovered ? '#EF4444' : primaryColor }}
              name={primaryLabel}
            />
            
            {/* Secondary line if provided */}
            {secondaryLabel && (
              <Line
                type="monotone"
                dataKey="secondary"
                stroke={secondaryColor}
                strokeWidth={2}
                dot={{ fill: secondaryColor, strokeWidth: 2, r: 3 }}
                strokeDasharray="5 5"
                name={secondaryLabel}
              />
            )}
            
            {/* Trend line if requested */}
            {showTrendLine && trendData.length > 0 && (
              <Line
                type="linear"
                dataKey="trend"
                stroke="#6B7280"
                strokeWidth={1}
                strokeDasharray="8 4"
                dot={false}
                name="Trend"
                data={trendData}
              />
            )}
            
            {/* Reference line for mid-point if domain is provided */}
            {domain && (
              <ReferenceLine 
                y={(domain[0] + domain[1]) / 2} 
                stroke="#6B7280" 
                strokeDasharray="2 2" 
                strokeOpacity={0.5}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TrendChart;
