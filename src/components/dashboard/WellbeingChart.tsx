import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export type ChartPoint = { date: string; wellbeing: number | null };

type Props = {
  data: ChartPoint[];
  title?: string; // optional header title; defaults to 'Overall Wellbeing'
};

export default function WellbeingChart({ data, title = 'Overall Wellbeing' }: Props) {
  const [hovered, setHovered] = React.useState(false);
  return (
  <div
    className={`bg-gradient-to-br from-gray-900/70 to-gray-800/60 p-6 rounded-2xl backdrop-blur-md transition-all ${hovered ? 'border border-red-600/60 shadow-[0_20px_60px_rgba(239,68,68,0.25)]' : 'border border-gray-700/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)]'}`}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
          <span className="text-xs text-gray-400">0-10</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickMargin={8} />
              <YAxis stroke="#9CA3AF" domain={[0, 10]} tickCount={6} fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: 'white' }}
              formatter={(value) => [`${value}`, 'Wellbeing']}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line
              type="monotone"
              dataKey="wellbeing"
              stroke={hovered ? '#EF4444' : '#EF4444'}
              strokeWidth={hovered ? 3 : 2.5}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: hovered ? 5 : 4 }}
              activeDot={{ r: hovered ? 7 : 6, fill: '#EF4444' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
