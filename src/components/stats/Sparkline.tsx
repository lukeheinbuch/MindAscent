import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineData {
  value: number;
}

interface SparklineProps {
  data: SparklineData[];
  title: string;
  currentValue: number;
  previousValue?: number;
  color?: string;
  unit?: string;
  height?: number;
  showTrend?: boolean;
  precision?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  title,
  currentValue,
  previousValue,
  color = '#EF4444',
  unit = '',
  height = 60,
  showTrend = true,
  precision = 1
}) => {
  // Calculate trend
  const trend = React.useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    const change = currentValue - previousValue;
    const percentage = (change / previousValue) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
      value: change
    };
  }, [currentValue, previousValue]);

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        {showTrend && trend && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs">
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Current Value */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-white">
          {currentValue.toFixed(precision)}
        </span>
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>

      {/* Sparkline Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional info */}
      {trend && (
        <div className="mt-2 text-xs text-gray-500">
          {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
          {Math.abs(trend.value).toFixed(precision)}{unit} vs previous
        </div>
      )}
    </motion.div>
  );
};

export default Sparkline;
