import React from 'react';

type KpiCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  color?: 'red' | 'green' | 'yellow' | 'blue';
  rankStyle?: {
    name: string;
    icon?: React.ReactNode;
    border: string;
    glow: string;
    bg: string;
  };
  size?: 'default' | 'compact';
  valueClassName?: string;
};

export default function KpiCard({ title, value, subtitle, icon, color = 'red', rankStyle, size = 'default', valueClassName }: KpiCardProps) {
  const ring = {
    red: 'hover:border-red-500/50 hover:shadow-red-500/10',
    green: 'hover:border-green-500/50 hover:shadow-green-500/10',
    yellow: 'hover:border-yellow-500/50 hover:shadow-yellow-500/10',
    blue: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
  }[color];

  const base = 'rounded-2xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between';
  const pad = size === 'compact' ? 'p-4' : 'p-6';
  const minH = size === 'compact' ? 'min-h-[140px]' : 'min-h-[170px]';
  const rankClasses = rankStyle ? `${rankStyle.border} ${rankStyle.glow} ${rankStyle.bg}` : 'border border-gray-700/70 bg-gradient-to-br from-gray-900/70 to-gray-800/60';
  const valueClasses = valueClassName || 'text-3xl font-black text-white drop-shadow-[0_8px_24px_rgba(239,68,68,0.15)]';

  const subtitleNode = subtitle
    ? (typeof subtitle === 'string'
        ? <p className="text-xs text-gray-400">{subtitle}</p>
        : <div className="text-xs text-gray-400">{subtitle}</div>)
    : null;

  return (
    <div className={`${base} ${pad} ${minH} ${rankClasses} hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${ring}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {rankStyle?.icon ? <span className="text-lg" aria-label={rankStyle.name}>{rankStyle.icon}</span> : null}
          {title}
        </h3>
        {icon && <div className="shrink-0">{icon}</div>}
      </div>
      <div className="space-y-1">
        <div className={valueClasses}>{value}</div>
        {subtitleNode}
      </div>
    </div>
  );
}
