import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  LogOut,
  Edit3,
  Flame,
  Award,
  Calendar,
  CalendarDays,
  CalendarRange,
  Zap,
  Activity as ActivityIcon,
  // 'Pulse' not available in lucide-react; reuse ActivityIcon for pulse-like icon
  Dumbbell,
  Medal,
  BookOpen,
  BookMarked,
  Library,
  Layers,
  Archive,
  Vault,
  Brain,
  Lightbulb,
  GraduationCap,
  Scroll,
  Book,
  Rocket,
} from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import KpiCard from '@/components/dashboard/KpiCard';
import { gamificationService, LEVEL_THRESHOLDS, ACHIEVEMENTS, getRankMeta } from '@/services/gamification';
import { useUserProgress } from '@/hooks/useUserProgress';

const Heatmap = dynamic(() => import('@/components/stats/Heatmap'), { ssr: false });

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const { kpis, wellbeingProgress, heatmap } = useUserProgress('90d');
  const [xpState, setXpState] = useState<{ xp: number; level: number; current: number; total: number; percent: number } | null>(null);
  const [achievementState, setAchievementState] = useState<{ unlocked: Set<string> }>({ unlocked: new Set() });

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Load local profile edits
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('profile_name');
      const savedBio = localStorage.getItem('profile_bio');
      setDisplayName(savedName || user?.email?.split('@')[0] || 'Athlete');
      setBio(savedBio || 'Insert bio');
    }

    // Load XP profile (demo mode safe)
    (async () => {
      try {
        if (!user) return;
        const profile = await gamificationService.getUserProfile(user.id || user.uid);
        if (profile) {
          const xp = profile.xp || 0;
          const { level, currentThreshold, nextThreshold, progressed, percent } = gamificationService.getRankProgress(xp);
          const total = Math.max(1, nextThreshold - currentThreshold);
          setXpState({ xp, level, current: progressed, total, percent });

          // Load unlocked achievements (demo only for now)
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem(`ach_state_${user.id || user.uid}`);
              if (raw) {
                const parsed = JSON.parse(raw);
                setAchievementState({ unlocked: new Set(parsed.unlocked || []) });
              }
            } catch {}
          }
        }
      } catch (e) { console.warn('XP load failed', e); }
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_name', displayName);
      localStorage.setItem('profile_bio', bio);
    }
    setEditing(false);
  };

  if (authLoading || loading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <PageContainer
        title="Profile"
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Your <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Profile</span></h1>}
        subtitle="Personalize your mental performance journey"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-700/70 bg-gradient-to-br from-gray-900/70 to-gray-800/60 p-6 mb-8 shadow-[0_20px_60px_rgba(239,68,68,0.15)]">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-red-600/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-red-500/10 blur-3xl" />
            {/* Neon red moving dot/line tracing the border */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none" className="block">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#ff2a2a" flood-opacity="0.95"/>
                    <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ff4040" flood-opacity="0.75"/>
                    <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#ff7a7a" flood-opacity="0.45"/>
                  </filter>
                </defs>
                {/* faint base border for path hint */}
                <rect x="1" y="1" width="998" height="298" rx="18" ry="18" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="2" />
                {/* single moving tail with strong neon glow */}
                <rect x="1" y="1" width="998" height="298" rx="18" ry="18" fill="none" stroke="#ff3b3b" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" pathLength={1000} strokeDasharray="100 900" className="dash" />
              </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-yellow-500 p-[2px] shadow-[0_10px_30px_rgba(239,68,68,0.35)]">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {(displayName || user?.email || 'A')[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-full"
                        placeholder="Your name"
                      />
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-full"
                        placeholder="Your bio"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm shadow-[0_8px_24px_rgba(239,68,68,0.35)]">Save</button>
                        <button onClick={() => setEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                        {displayName}
                        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                      </h1>
                      <p className="text-gray-400">{bio}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => router.push('/checkin')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-500/50"
                >
                  New Check-in
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-[0_8px_24px_rgba(239,68,68,0.35)]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Removed mini wellbeing progress per user request */}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8">
            {/* Rank / XP card with mini progress bar (aligned with dashboard math) */}
            {xpState && (() => {
              const meta = getRankMeta(xpState.level);
              const pct = Math.round(xpState.percent);
              const visuals: Record<string, { border: string; glow: string; bg: string } > = {
                bronze: { border: 'border border-[#cd7f32]/50', glow: 'shadow-[0_0_24px_rgba(205,127,50,0.35)]', bg: 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' },
                silver: { border: 'border border-gray-400/50', glow: 'shadow-[0_0_26px_rgba(192,192,192,0.35)]', bg: 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' },
                gold: { border: 'border border-yellow-400/60', glow: 'shadow-[0_0_28px_rgba(255,215,0,0.45)]', bg: 'bg-gradient-to-br from-gray-900/80 to-yellow-900/20' },
                platinum: { border: 'border border-cyan-300/50', glow: 'shadow-[0_0_30px_rgba(154,213,255,0.45)]', bg: 'bg-gradient-to-br from-gray-900/80 to-cyan-900/20' },
                diamond: { border: 'border border-cyan-400/60', glow: 'shadow-[0_0_34px_rgba(106,227,255,0.55)]', bg: 'bg-gradient-to-br from-gray-900/80 to-cyan-800/30' },
                elite: { border: 'border border-pink-400/60', glow: 'shadow-[0_0_38px_rgba(255,95,162,0.55)]', bg: 'bg-gradient-to-br from-gray-900/80 to-pink-900/30' },
                champion: { border: 'border border-red-500/70', glow: 'shadow-[0_0_42px_rgba(255,45,85,0.60)]', bg: 'bg-gradient-to-br from-gray-900/80 to-red-900/30' },
              };
              const v = visuals[meta.tier] || visuals.bronze;
              return (
                <KpiCard
                  title="Rank"
                  value={<span className="font-semibold" style={{ color: meta.color }}>{meta.title}</span>}
                  valueClassName="text-xs md:text-sm font-black text-white drop-shadow-[0_8px_24px_rgba(239,68,68,0.2)]"
                  subtitle={
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1">
                        <span>{xpState.current} XP</span>
                        <span className="font-semibold text-gray-300">{pct}%</span>
                        <span>{xpState.total} XP</span>
                      </div>
                      <div className="h-2 w-full bg-gray-900/70 rounded-full overflow-hidden border border-gray-700/80">
                        <div className="h-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  }
                  // Keep only one flame: use trailing icon, no rankStyle.icon
                  icon={<Flame className="text-red-500" size={20} />}
                  color="yellow"
                  rankStyle={{ name: meta.title, border: v.border, glow: v.glow, bg: v.bg }}
                />
              );
            })()}
            <KpiCard title="Current Streak" value={<span className="text-red-500 font-semibold">{kpis?.streakDays ?? 0} days</span>} icon={<Target className="w-5 h-5 text-red-500" />} />
            <KpiCard title="Weekly Avg Wellbeing" value={<span className="text-yellow-500">{kpis?.weeklyAvgWellbeing ?? 0}</span>} icon={<TrendingUp className="text-yellow-500" size={24} />} color="yellow" />
            <KpiCard title="Total Check-ins" value={<span className="text-green-500 font-semibold">{kpis?.totalCheckIns ?? 0}</span>} color="green" icon={<TrendingUp className="w-5 h-5 text-green-500" />} />
          </div>
          {xpState && (
            <div className="mb-10 -mt-4 relative">
              <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-br from-red-500/5 via-transparent to-transparent blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative">
                <span className="text-xs uppercase tracking-wide text-gray-400">Rank {xpState.level}</span>
                <span className="text-[10px] text-gray-400">{Math.round(xpState.percent)}% to Rank {xpState.level + 1}</span>
              </div>
              <div className="h-4 w-full bg-gray-900/70 backdrop-blur rounded-full overflow-hidden border border-gray-700/80 relative shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.05)_0%,transparent_40%,transparent_60%,rgba(255,255,255,0.05)_100%)]" />
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-700 shadow-[0_0_18px_-2px_rgba(239,68,68,0.75)] transition-all duration-700 ease-out" style={{ width: `${xpState.percent}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-2 text-[7px] md:text-[8px] lg:text-[9px] font-medium tracking-wide text-gray-500">
                  <span>{xpState.current} XP</span>
                  <span>{xpState.total} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Check-in Heatmap (smaller) and Achievements (wider) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            <div className="lg:col-span-2">
              {heatmap && (
                <Heatmap
                  title="Check-in Heatmap"
                  data={heatmap.cells}
                  xLabels={heatmap.xLabels}
                  yLabels={heatmap.yLabels}
                  colorScale={["#111827", "#EF4444"]}
                  height={250}
                  showValues={false}
                />
              )}
              {!heatmap && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center h-[250px] flex items-center justify-center">
                  <p className="text-gray-400">Complete check-ins to populate your heatmap</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-3 bg-gray-800/70 rounded-2xl p-6 border border-gray-700/80 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_25%,rgba(239,68,68,0.15),transparent_60%)]" />
              <div className="flex items-center justify-between mb-5 relative">
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">Achievements <Award className="w-5 h-5 text-yellow-400" /></h3>
                <span className="text-xs text-gray-400">Earn XP by unlocking milestones</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {ACHIEVEMENTS.slice(0,20).map(a => {
                  const unlocked = achievementState.unlocked.has(a.id);
                  const Icon = ({ className }: { className?: string }) => {
                    switch (a.icon) {
                      case 'calendar': return <Calendar className={className} />;
                      case 'calendar-days': return <CalendarDays className={className} />;
                      case 'calendar-range': return <CalendarRange className={className} />;
                      case 'flame': return <Flame className={className} />;
                      case 'zap': return <Zap className={className} />;
                      case 'activity': return <ActivityIcon className={className} />;
                      case 'pulse': return <ActivityIcon className={className} />;
                      case 'dumbbell': return <Dumbbell className={className} />;
                      case 'trophy': return <Trophy className={className} />;
                      case 'medal': return <Medal className={className} />;
                      case 'book-open': return <BookOpen className={className} />;
                      case 'book-marked': return <BookMarked className={className} />;
                      case 'library': return <Library className={className} />;
                      case 'layers': return <Layers className={className} />;
                      case 'archive': return <Archive className={className} />;
                      case 'vault': return <Vault className={className} />;
                      case 'brain': return <Brain className={className} />;
                      case 'lightbulb': return <Lightbulb className={className} />;
                      case 'graduation-cap': return <GraduationCap className={className} />;
                      case 'scroll': return <Scroll className={className} />;
                      case 'books': return <Library className={className} />;
                      case 'university': return <Book className={className} />;
                      case 'rocket': return <Rocket className={className} />;
                      default: return <Award className={className} />;
                    }
                  };
                  return (
                    <div
                      key={a.id}
                      className={`group relative rounded-xl p-3 border transition-all duration-500 ease-out transform ${unlocked ? 'border-red-500/60 bg-gray-900/70 shadow-[0_0_18px_-2px_rgba(239,68,68,0.55)]' : 'border-gray-700 bg-gray-900/40'} hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_22px_60px_rgba(239,68,68,0.30)] hover:border-red-500/60 hover:bg-gray-900/60`}
                    >
                      {/* Shimmer sweep */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                        <div className="absolute -inset-y-4 -left-1/2 w-2/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out -translate-x-1/2 group-hover:translate-x-[130%] blur-sm" />
                      </div>

                      {/* Soft radial glow */}
                      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.28),transparent_60%)] z-0" />

                      {/* Pulsing ring when unlocked */}
                      {unlocked && (
                        <div className="absolute -inset-[2px] rounded-[14px] border border-red-500/30 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none z-10" />
                      )}

                      {/* Hover red outline (locked or unlocked) */}
                      <div className="absolute inset-0 rounded-xl ring-1 ring-red-500/60 opacity-0 group-hover:opacity-100 pointer-events-none z-20" />

                      {/* Icon with hover motion */}
                      <div className="relative inline-flex">
                        <Icon className={`w-7 h-7 mb-2 relative transition-all duration-300 ${unlocked ? 'text-yellow-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.65)]' : 'text-gray-500'} group-hover:translate-y-[-3px] group-hover:scale-125 group-hover:rotate-[2deg]`} />
                      </div>

                      {/* Label with subtle glow on hover */}
                      <div className={`text-[10px] font-semibold uppercase tracking-wide transition-all duration-300 ${unlocked ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-gray-300 group-hover:text-white'} group-hover:tracking-wider`}>{a.label}</div>

                      {/* Progress bar animates in */}
                      <div className={`mt-1 h-1.5 w-full rounded-full overflow-hidden ${unlocked ? 'bg-gray-800/60' : 'bg-gray-800'}`}>
                        <div className={`h-full ${unlocked ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 w-full shadow-[0_0_14px_rgba(239,68,68,0.55)]' : 'bg-gray-700 w-0'} transition-all duration-700`} />
                      </div>

                      {/* XP text fades up */}
                      <div className={`mt-1 text-[10px] transition-all ${unlocked ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-gray-400 group-hover:text-gray-300'} group-hover:scale-[1.03]`}>+{a.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
        <style jsx>{`
          .dash {
            animation: move-dash 7s linear infinite;
          }
          @keyframes move-dash {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -1000; }
          }
        `}</style>
      </PageContainer>
    </Layout>
  );
};

export default ProfilePage;

