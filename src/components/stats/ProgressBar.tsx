import React from 'react';

export default function ProgressBar({ current, target, percent, title = 'Average Overall Wellbeing' }: { current: number; target: number; percent: number; title?: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">Target: {target}</span>
      </div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-600 to-red-500" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-sm">
        <span className="text-gray-300">Current: <span className="text-white font-semibold">{current}</span></span>
        <span className="text-gray-400">{percent}%</span>
      </div>
    </div>
  );
}
