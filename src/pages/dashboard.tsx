"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Target, Activity, TrendingUp, CheckSquare, Award, Flame, Circle, Shield, Star, Diamond, Trophy, Crown } from 'lucide-react';
import { getRankMeta } from '@/services/gamification';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { useToast } from '@/components/Toast';
import KpiCard from '@/components/dashboard/KpiCard';
import { useUserProgress, Range } from '@/hooks/useUserProgress';
import { useProfile } from '@/hooks/useProfile';

const WellbeingChart = dynamic(() => import('@/components/dashboard/WellbeingChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900/60 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
      <div className="h-72 animate-pulse bg-gray-800/60 rounded-xl" />
    </div>
  ),
});

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const displayName = (profile?.username || profile?.display_name || user?.email || 'Athlete') as string;
  const { error: pushToast } = useToast();
  const [selectedRange, setSelectedRange] = useState<Range>('30d');
  const { isLoading, error, kpis, chart } = useUserProgress(selectedRange);
  // ensure profile is fetched

  const hasData = (kpis?.totalCheckIns ?? 0) > 0 || (chart?.points?.length ?? 0) > 0;

  const handleRangeChange = (r: Range) => setSelectedRange(r);

  useEffect(() => {
    if (error) pushToast('Dashboard Error', error);
  }, [error, pushToast]);

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <PageContainer
        title="Dashboard"
        subtitle="Let's work on your mental game today."
        actions={null}
        titleNode={(<h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(239,68,68,0.35)]">{displayName}</span>!</h1>)}
      >
        {/* Neon red moving tracer around the whole page content */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-2 md:-inset-3 lg:-inset-4 z-10">
            <svg width="100%" height="100%" viewBox="0 0 1000 1400" preserveAspectRatio="none" className="block">
              <defs>
                <filter id="dashGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#ff2a2a" flood-opacity="0.95"/>
                  <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ff4040" flood-opacity="0.75"/>
                  <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#ff7a7a" flood-opacity="0.45"/>
                </filter>
              </defs>
              <rect x="1" y="1" width="998" height="1398" rx="24" ry="24" fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth="2" />
              <rect x="1" y="1" width="998" height="1398" rx="24" ry="24" fill="none" stroke="#ff3b3b" strokeWidth="5" strokeLinecap="round" filter="url(#dashGlow)" pathLength={1000} strokeDasharray="110 890" className="dash-page" />
            </svg>
          </div>

          {/* Page content starts here */}
        {/* KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <KpiCard title="Current Streak" value={<span className="text-red-500">{kpis?.streakDays ?? 0}</span>} icon={<Target className="text-red-500" size={24} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <KpiCard title="Total Check-ins" value={<span className="text-green-500">{kpis?.totalCheckIns ?? 0}</span>} icon={<CheckSquare className="text-green-500" size={24} />} color="green" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <KpiCard
              title="Average Wellbeing"
              value={<span className="text-yellow-500">{kpis?.avgWellbeing ?? 0}</span>}
              icon={<TrendingUp className="text-yellow-500" size={24} />}
              color="yellow"
              subtitle={<span className="text-[11px] text-gray-400">Based on selected range</span>}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            {kpis && (() => {
              const meta = getRankMeta(kpis.level);
              const current = kpis.xp - kpis.currentLevelXP;
              const total = kpis.nextLevelXP - kpis.currentLevelXP;
              const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
              const rankVisual: Record<string, { border: string; glow: string; bg: string; }> = {
                bronze: { border: 'border border-[#cd7f32]/50', glow: 'shadow-[0_0_24px_rgba(205,127,50,0.35)]', bg: 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' },
                silver: { border: 'border border-gray-400/50', glow: 'shadow-[0_0_26px_rgba(192,192,192,0.35)]', bg: 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' },
                gold: { border: 'border border-yellow-400/60', glow: 'shadow-[0_0_28px_rgba(255,215,0,0.45)]', bg: 'bg-gradient-to-br from-gray-900/80 to-yellow-900/20' },
                platinum: { border: 'border border-cyan-300/50', glow: 'shadow-[0_0_30px_rgba(154,213,255,0.45)]', bg: 'bg-gradient-to-br from-gray-900/80 to-cyan-900/20' },
                diamond: { border: 'border border-cyan-400/60', glow: 'shadow-[0_0_34px_rgba(106,227,255,0.55)]', bg: 'bg-gradient-to-br from-gray-900/80 to-cyan-800/30' },
                elite: { border: 'border border-pink-400/60', glow: 'shadow-[0_0_38px_rgba(255,95,162,0.55)]', bg: 'bg-gradient-to-br from-gray-900/80 to-pink-900/30' },
                champion: { border: 'border border-red-500/70', glow: 'shadow-[0_0_42px_rgba(255,45,85,0.60)]', bg: 'bg-gradient-to-br from-gray-900/80 to-red-900/30' },
              };
              const visual = rankVisual[meta.tier] || rankVisual.bronze;
              return (
                <div className="flex flex-col h-full">
                  <KpiCard
                    title="Rank"
                    value={<span className="font-extrabold" style={{ color: meta.color }}>{meta.title}</span>}
                    valueClassName="text-4xl md:text-5xl font-black text-white drop-shadow-[0_8px_24px_rgba(239,68,68,0.25)]"
                    subtitle={
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-[9px] md:text-[10px] text-gray-400 mb-1">
                          <span>{current} XP</span>
                          <span className="font-semibold text-gray-300">{Math.round(percent)}%</span>
                          <span>{total} XP</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900/70 rounded-full overflow-hidden border border-gray-700/80">
                          <div className="h-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-700" style={{ width: `${Math.round(percent)}%` }} />
                        </div>
                      </div>
                    }
                    icon={<Flame className="text-red-500" size={24} />}
                    color="yellow"
                    rankStyle={{
                      name: meta.title,
                      // no left icon to ensure only one flame overall
                      border: visual.border,
                      glow: visual.glow,
                      bg: visual.bg,
                    }}
                  />
                </div>
              );
            })()}
          </motion.div>
        </div>

        {/* Wellbeing Chart */}
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Average Wellbeing</h2>
            <div className="inline-flex bg-gray-900/70 backdrop-blur-sm rounded-xl p-1 border border-gray-700/70 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              {(['7d','30d','90d'] as Range[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedRange === r ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_10px_20px_rgba(239,68,68,0.35)]' : 'text-gray-300 hover:bg-gray-800/80'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {chart?.points && <WellbeingChart data={chart.points} title={`${selectedRange} Overview`} />}
        </motion.div>

        {/* Call To Action if no data */}
        {!hasData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-600/30 p-8 rounded-3xl text-center backdrop-blur-md shadow-2xl"
          >
            <h2 className="text-2xl font-black text-white mb-4">Focus on Your Mental Health Today</h2>
            <p className="text-lg text-gray-300 mb-6">
              Check in and build consistent habits that support your well-being and performance.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/checkin')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-3 mx-auto shadow-[0_20px_60px_rgba(239,68,68,0.35)]"
            >
              <CheckSquare size={24} />
              Start Performance Check-in
            </motion.button>
          </motion.div>
        )}

        </div>
        <style jsx>{`
          .dash-page {
            animation: move-dash-page 9s linear infinite;
          }
          @keyframes move-dash-page {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -1000; }
          }
        `}</style>
      </PageContainer>
    </Layout>
  );
};

const DashboardPage: React.FC = () => (
  <RequireAuth>
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  </RequireAuth>
);

export default DashboardPage;
