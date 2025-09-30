import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface ScatterData {
  x: number;
  y: number;
  label?: string;
  category?: string;
}

interface ScatterPlotProps {
  data: ScatterData[];
  title: string;
  xLabel: string;
  yLabel: string;
  color?: string;
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  showTrendLine?: boolean;
  showCorrelation?: boolean;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xLabel,
  yLabel,
  color = '#EF4444',
  height = 300,
  xDomain,
  yDomain,
  showTrendLine = false,
  showCorrelation = false
}) => {
  // Calculate correlation coefficient
  const correlation = React.useMemo(() => {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const x = data.map(d => d.x);
    const y = data.map(d => d.y);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }, [data]);

  // Calculate trend line if requested
  const trendLine = React.useMemo(() => {
    if (!showTrendLine || data.length < 2) return null;
    
    const n = data.length;
    const x = data.map(d => d.x);
    const y = data.map(d => d.y);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  }, [data, showTrendLine]);

  const getCorrelationStrength = (r: number) => {
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationColor = (r: number) => {
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'text-green-400';
    if (abs >= 0.5) return 'text-yellow-400';
    if (abs >= 0.3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    if (props && props.payload) {
      const point = props.payload;
      return [
        `${xLabel}: ${point.x?.toFixed(1)}`,
        `${yLabel}: ${point.y?.toFixed(1)}`,
        point.label && `Label: ${point.label}`
      ].filter(Boolean);
    }
    return [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showCorrelation && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Correlation</p>
            <p className={`text-sm font-medium ${getCorrelationColor(correlation)}`}>
              {correlation >= 0 ? '+' : ''}{correlation.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">
              {getCorrelationStrength(correlation)}
            </p>
          </div>
        )}
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number"
              dataKey="x"
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={xDomain}
              label={{ value: xLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <YAxis 
              type="number"
              dataKey="y"
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={yDomain}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
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
              cursor={{ strokeDasharray: '3 3' }}
            />
            
            <Scatter 
              data={data} 
              fill={color}
              fillOpacity={0.7}
              r={5}
            />
            
            {/* Trend line */}
            {trendLine && (
              <Scatter
                data={trendLine}
                fill="none"
                line={{ stroke: '#6B7280', strokeWidth: 2, strokeDasharray: '5 5' }}
                shape={() => <g />}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ScatterPlot;
