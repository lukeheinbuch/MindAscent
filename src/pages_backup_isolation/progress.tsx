'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { RequireAuth } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { TrendingUp, Target, Smile, CheckSquare, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import KpiCard from '@/components/dashboard/KpiCard';
import { useUserProgress, Range } from '@/hooks/useUserProgress';

const WellbeingChart = dynamic(() => import('@/components/dashboard/WellbeingChart'), { ssr: false });
const MetricRadar = dynamic(() => import('@/components/stats/MetricRadar'), { ssr: false });
const TrendChart = dynamic(() => import('@/components/stats/TrendChart'), { ssr: false });
const ProgressBar = dynamic(() => import('@/components/stats/ProgressBar'), { ssr: false });

const ProgressPageContent: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<Range>('30d');
  const { kpis, chart, series, weekly, resilience, wellbeingProgress } = useUserProgress(selectedRange);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('progress_range');
      if (saved && ['7d','30d','90d'].includes(saved)) setSelectedRange(saved as Range);
    }
  }, []);

  const handleRangeChange = (r: Range) => {
    setSelectedRange(r);
    if (typeof window !== 'undefined') localStorage.setItem('progress_range', r);
  };

  // Determine top metric by average across selected range (exclude Sleep which is hours)
  const topMetric = React.useMemo(() => {
    if (!series) return null;
    const keys: Array<{ key: keyof typeof series; label: string }> = [
      { key: 'mood', label: 'Mood' },
      { key: 'stress_management', label: 'Stress Mgmt' },
      { key: 'energy', label: 'Energy' },
      { key: 'motivation', label: 'Motivation' },
      { key: 'confidence', label: 'Confidence' },
      { key: 'focus', label: 'Focus' },
      { key: 'recovery', label: 'Recovery' },
      // Sleep excluded from comparison (different scale: hours)
    ];
    let best: { label: string; value: number } | null = null;
    for (const { key, label } of keys) {
      const arr = (series[key] || []).map(p => p.value).filter((v): v is number => typeof v === 'number');
      if (!arr.length) continue;
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      if (!best || avg > best.value) best = { label, value: avg };
    }
    return best;
  }, [series]);

  return (
    <Layout title="Progress">
      <PageContainer
        title="Progress"
        subtitle="Your wellbeing, trends, and consistency over time."
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Progress <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Overview</span></h1>}
        actions={
          <div className="inline-flex bg-gray-900/70 rounded-xl p-1 border border-gray-700/70">
            {(['7d','30d','90d'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedRange === r ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'text-gray-300 hover:bg-gray-800/80'}`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      >

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8">
          <KpiCard title="Average Overall Wellbeing" value={<span className="text-yellow-500">{kpis?.avgWellbeing ?? 0}</span>} color="yellow" icon={<TrendingUp className="text-yellow-500" size={24} />} />
          <KpiCard title="Current Streak" value={<span className="text-red-500">{kpis?.streakDays ?? 0} days</span>} icon={<Target className="text-red-500" size={24} />} />
          <KpiCard title="Total Check-ins" value={<span className="text-green-500">{kpis?.totalCheckIns ?? 0}</span>} color="green" icon={<CheckSquare className="text-green-500" size={24} />} />
          {topMetric && (
            <KpiCard
              title="Top Metric"
              value={<span className="text-purple-400">{`${topMetric.label} ${topMetric.value.toFixed(1)}/10`}</span>}
              subtitle={<span className="text-gray-400">Average over {selectedRange}</span>}
              icon={<Star className="text-purple-400" size={24} />}
            />
          )}
        </div>

        {/* Wellbeing Chart + Progress Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
          <div className="lg:col-span-2">
            <WellbeingChart data={chart.points} />
          </div>
          <div className="lg:col-span-1">
            {(wellbeingProgress || typeof kpis?.avgWellbeing === 'number') && (
              <ProgressBar
                title="Average Overall Wellbeing"
                current={kpis?.avgWellbeing ?? 0}
                target={wellbeingProgress?.target ?? 80}
                percent={Math.min(100, Math.round(((kpis?.avgWellbeing ?? 0) / (wellbeingProgress?.target ?? 80)) * 100))}
              />
            )}
          </div>
        </div>

        {/* Averages Overview (by selected timeframe) */}
        {series && (
          <div className="mb-8">
            <MetricRadar
              title={`Weekly Averages Overview (${selectedRange})`}
              data={[
                { metric: 'Mood', score: (() => { const arr = series.mood.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Stress Mgmt', score: (() => { const arr = series.stress_management.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Energy', score: (() => { const arr = series.energy.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Motivation', score: (() => { const arr = series.motivation.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Confidence', score: (() => { const arr = series.confidence.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Focus', score: (() => { const arr = series.focus.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
                { metric: 'Recovery', score: (() => { const arr = series.recovery.map(p=>p.value).filter((v): v is number => typeof v === 'number'); return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0; })() },
              ].filter(d => (d.score ?? 0) > 0)}
            />
          </div>
        )}

        {/* Per-metric trends with 7-day rolling averages, ignoring missing values */}
        {series && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-8">
            <TrendChart title="Mood Trend" data={series.mood.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Mood" />
            <TrendChart title="Stress Mgmt Trend" data={series.stress_management.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Stress Mgmt" primaryColor="#F59E0B" />
            <TrendChart title="Energy Trend" data={series.energy.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Energy" primaryColor="#10B981" />
            <TrendChart title="Motivation Trend" data={series.motivation.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Motivation" primaryColor="#8B5CF6" />
            <TrendChart title="Confidence Trend" data={series.confidence.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Confidence" primaryColor="#3B82F6" />
            <TrendChart title="Focus Trend" data={series.focus.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Focus" primaryColor="#EC4899" />
            <TrendChart title="Recovery Trend" data={series.recovery.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Recovery" primaryColor="#34D399" />
            <TrendChart title="Sleep Quality Trend" data={series.sleep.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))} primaryLabel="Sleep Quality" primaryColor="#A78BFA" />
          </div>
        )}

        {/* Resilience: Recovery + Stress Management (explained) */}
        {resilience && (
          <div className="mb-8">
            <TrendChart
              title={`Resilience Score (Avg: ${resilience.avg.toFixed(1)}) — Combines Recovery and Stress Management (higher is better)`}
              data={resilience.daily.filter(p => typeof p.value === 'number').map(p => ({ date: p.date, value: p.value as number }))}
              primaryLabel="Resilience"
              primaryColor="#22D3EE"
            />
          </div>
        )}

        {/* Empty state CTA if no data */}
        {!(chart.points || []).some(p => p.wellbeing !== null) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-600/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Tracking?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Complete your first check-in to unlock progress insights.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.location.href = '/checkin'} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25">
              Complete First Check-in
            </motion.button>
          </motion.div>
        )}

      </PageContainer>
    </Layout>
  );
};

const ProgressPage: React.FC = () => (
  <ClientOnly>
    <RequireAuth>
      <ProgressPageContent />
    </RequireAuth>
  </ClientOnly>
);

export default ProgressPage;
