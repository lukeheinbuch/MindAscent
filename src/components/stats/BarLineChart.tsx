import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface BarLineData {
  name: string;
  barValue: number;
  lineValue?: number;
  category?: string;
}

interface BarLineChartProps {
  data: BarLineData[];
  title: string;
  barLabel: string;
  lineLabel?: string;
  barColor?: string;
  lineColor?: string;
  height?: number;
  showLegend?: boolean;
  barDomain?: [number, number];
  lineDomain?: [number, number];
  unit?: string;
}

const BarLineChart: React.FC<BarLineChartProps> = ({
  data,
  title,
  barLabel,
  lineLabel,
  barColor = '#EF4444',
  lineColor = '#10B981',
  height = 300,
  showLegend = true,
  barDomain,
  lineDomain,
  unit = ''
}) => {
  const formatTooltip = (value: any, name: string | undefined) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(1)}${unit}`, name];
    }
    return [value, name];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="bar"
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={barDomain}
            />
            {lineLabel && (
              <YAxis 
                yAxisId="line"
                orientation="right"
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                domain={lineDomain}
              />
            )}
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
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: '#D1D5DB' }}
                iconType="line"
              />
            )}
            
            <Bar 
              yAxisId="bar"
              dataKey="barValue" 
              fill={barColor}
              name={barLabel}
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {lineLabel && (
              <Line 
                yAxisId="line"
                type="monotone" 
                dataKey="lineValue" 
                stroke={lineColor}
                strokeWidth={3}
                dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: lineColor }}
                name={lineLabel}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default BarLineChart;
