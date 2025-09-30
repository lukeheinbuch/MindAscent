import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export type RadarDatum = { metric: string; score: number };

export default function MetricRadar({ data, title = 'Weekly Overview' }: { data: RadarDatum[]; title?: string }) {
  const [hovered, setHovered] = React.useState(false);
  const tickFormatter = (v: any) => (typeof v === 'number' ? v.toFixed(0) : v);
  return (
    <div
      className={`rounded-xl p-6 border transition-colors ${hovered ? 'bg-gray-800/90 border-red-600/60 shadow-[0_10px_30px_rgba(239,68,68,0.25)]' : 'bg-gray-800 border-gray-700'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={tickFormatter} />
            <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', color: 'white' }} formatter={(v: any) => [`${Number(v).toFixed(1)}`, 'Score']} />
            <Radar name="Score" dataKey="score" stroke={hovered ? '#EF4444' : '#EF4444'} fill="#EF4444" fillOpacity={hovered ? 0.45 : 0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
