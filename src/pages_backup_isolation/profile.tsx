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
  Heart,
  Check,
} from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import KpiCard from '@/components/dashboard/KpiCard';
import { ACHIEVEMENTS, getRankMeta } from '@/services/gamification';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabaseClient';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile: supaProfile, isLoading: profileLoading } = useProfile();

  const { kpis, wellbeingProgress, heatmap } = useUserProgress('90d');
  const [achievementState, setAchievementState] = useState<{ unlocked: Set<string> }>({ unlocked: new Set() });

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Athlete details (editable)
  const [profileEditing, setProfileEditing] = useState(false);
  const [sport, setSport] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [country, setCountry] = useState<string>('');
  const [goalsText, setGoalsText] = useState<string>('');
  const [aboutMe, setAboutMe] = useState<string>('');

  // Daily tasks state - automatically updated based on user activity
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const dailyTasks = [
    { id: 'checkin', icon: Zap, label: 'Daily Check-in', xp: 50, color: 'from-blue-500 to-cyan-500' },
    { id: 'exercise', icon: Dumbbell, label: 'Do an Exercise', xp: 30, color: 'from-purple-500 to-pink-500' },
    { id: 'resource', icon: Heart, label: 'Check a Resource', xp: 20, color: 'from-red-500 to-orange-500' },
    { id: 'education', icon: BookOpen, label: 'View Education', xp: 25, color: 'from-green-500 to-emerald-500' },
  ];

  // Auto-complete tasks based on user activity
  useEffect(() => {
    if (!kpis) return;
    
    const newCompleted = new Set<string>();
    
    // Check-in: if user has any check-ins or just completed one
    if (kpis.totalCheckIns > 0 || localStorage.getItem('checkinCompleted') === 'true') newCompleted.add('checkin');
    
    // Exercise: if user has completed any exercises or clicked one
    if (kpis.exercisesCompleted > 0 || localStorage.getItem('exerciseClicked') === 'true') newCompleted.add('exercise');
    
    // We'll track education and resources via localStorage since they're not in KPI
    const educationViewed = localStorage.getItem('educationViewed') === 'true';
    const resourceViewed = localStorage.getItem('resourceViewed') === 'true';
    
    if (educationViewed) newCompleted.add('education');
    if (resourceViewed) newCompleted.add('resource');
    
    setCompletedTasks(newCompleted);
  }, [kpis]);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Prefer Supabase profile fields; fall back to local storage then email-derived
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('profile_name');
      const savedBio = localStorage.getItem('profile_bio');
      const fromDbName = (supaProfile?.display_name || supaProfile?.username || '').trim();
      const fromDbBio = (supaProfile?.about || '').trim();
      setDisplayName(fromDbName || savedName || user?.email?.split('@')[0] || 'Athlete');
      setBio(fromDbBio || savedBio || 'Insert bio');
      setAvatarUrl(supaProfile?.avatar_url || null);

      // hydrate athlete fields
      setSport(supaProfile?.sport || '');
      setLevel(supaProfile?.level || '');
      setAge(typeof supaProfile?.age === 'number' ? supaProfile.age : '');
      setCountry(supaProfile?.country || '');
      setGoalsText((supaProfile?.goals && supaProfile.goals.length ? supaProfile.goals.join(', ') : ''));
      setAboutMe(supaProfile?.about || '');
    }

    // Load unlocked achievements (demo only for now)
    if (typeof window !== 'undefined' && user) {
      try {
        const raw = localStorage.getItem(`ach_state_${user.id || user.uid}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAchievementState({ unlocked: new Set(parsed.unlocked || []) });
        }
      } catch {}
    }
    setLoading(false);
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    // optimistic preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Avatar upload failed. Please ensure a Supabase bucket named "avatars" exists.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAthleteProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const goals = goalsText
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      await supabase
        .from('profiles')
        .update({
          sport: sport || null,
          level: level || null,
          age: typeof age === 'number' ? age : age ? Number(age) : null,
          country: country || null,
          goals: goals.length ? goals : null,
          about: aboutMe || null,
        })
        .eq('id', user.id);
      setProfileEditing(false);
    } catch (err) {
      console.error('Save athlete profile failed', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_name', displayName);
      localStorage.setItem('profile_bio', bio);
    }
    setEditing(false);
  };

  if (authLoading || loading || profileLoading) {
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
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-yellow-500 p-[2px] shadow-[0_10px_30px_rgba(239,68,68,0.35)]">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">
                        {(displayName || user?.email || 'A')[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow-[0_8px_24px_rgba(239,68,68,0.35)]">
                    {uploading ? '...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
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
            {kpis && (() => {
              const meta = getRankMeta(kpis.level);
              const current = kpis.xp - kpis.currentLevelXP;
              const total = kpis.nextLevelXP - kpis.currentLevelXP;
              const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
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
                  value={<span className="font-extrabold" style={{ color: meta.color }}>{meta.title}</span>}
                  valueClassName="text-2xl md:text-3xl font-black text-white drop-shadow-[0_8px_24px_rgba(239,68,68,0.25)]"
                  subtitle={
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[9px] md:text-[10px] text-gray-400 mb-1">
                        <span>{current} XP</span>
                        <span className="font-semibold text-gray-300">{pct}%</span>
                        <span>{total} XP</span>
                      </div>
                      <div className="h-2 w-full bg-gray-900/70 rounded-full overflow-hidden border border-gray-700/80">
                        <div className="h-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  }
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

          {/* Athlete Profile Details */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="relative overflow-hidden rounded-2xl p-6 border border-gray-700/80 bg-gradient-to-br from-gray-900 via-gray-900/60 to-gray-800">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.08),transparent_35%)]" />
              <div className="flex items-center justify-between mb-4 relative">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-white" /> Athlete Profile
                </h3>
                <div className="flex gap-2">
                  {profileEditing ? (
                    <>
                      <button
                        onClick={handleSaveAthleteProfile}
                        disabled={savingProfile}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm shadow-[0_8px_24px_rgba(239,68,68,0.35)] disabled:opacity-60"
                      >
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setProfileEditing(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setProfileEditing(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm relative">
                {[{
                  label: 'Sport',
                  value: sport,
                  onChange: (v: string) => setSport(v)
                }, {
                  label: 'Level',
                  value: level,
                  onChange: (v: string) => setLevel(v)
                }, {
                  label: 'Age',
                  value: age,
                  onChange: (v: string) => setAge(v ? Number(v) : ''),
                  type: 'number'
                }, {
                  label: 'Country',
                  value: country,
                  onChange: (v: string) => setCountry(v)
                }].map((field, idx) => (
                  <div key={field.label} className="rounded-xl border border-gray-700/80 bg-gray-900/60 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                    <div className="text-gray-400 text-xs mb-1">{field.label}</div>
                    {profileEditing ? (
                      <input
                        value={field.value as any}
                        onChange={(e)=>field.onChange(e.target.value)}
                        type={field.type || 'text'}
                        className="w-full bg-gray-950/70 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      />
                    ) : (
                      <div className="text-white font-medium">{field.value || '—'}</div>
                    )}
                  </div>
                ))}

                <div className="md:col-span-2 rounded-xl border border-gray-700/80 bg-gray-900/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-300 text-sm">Goals</div>
                    {!profileEditing && goalsText && (
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">Updated</span>
                    )}
                  </div>
                  {profileEditing ? (
                    <input
                      value={goalsText}
                      onChange={(e)=>setGoalsText(e.target.value)}
                      placeholder="Comma separated goals"
                      className="w-full bg-gray-950/70 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {goalsText ? goalsText.split(',').map(g => g.trim()).filter(Boolean).map(g => (
                        <span key={g} className="text-xs px-3 py-1 rounded-full bg-red-600/20 text-red-100 border border-red-500/30">{g}</span>
                      )) : <span className="text-gray-400">—</span>}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 rounded-xl border border-gray-700/80 bg-gray-900/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <div className="text-gray-300 text-sm mb-2">About Me</div>
                  {profileEditing ? (
                    <textarea
                      value={aboutMe}
                      onChange={(e)=>setAboutMe(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-950/70 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-200 leading-relaxed">{aboutMe || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Daily Tasks and Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            {/* Daily Tasks */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-gray-700/80 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
                {/* Animated gradient background */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Daily Tasks
                  </h3>
                  <span className="text-sm text-gray-400">Earn XP today</span>
                </div>

                <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                  {dailyTasks.map((task) => {
                    const TaskIcon = task.icon;
                    const isCompleted = completedTasks.has(task.id);
                    
                    return (
                      <div
                        key={task.id}
                        className={`w-full group relative rounded-xl p-4 border transition-all duration-300 ${
                          isCompleted
                            ? 'border-green-500/60 bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                            : 'border-gray-700 bg-gray-800/40'
                        } overflow-hidden flex flex-col`}
                      >
                        {/* Completion glow */}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_70%)] pointer-events-none" />
                        )}

                        <div className="flex flex-col items-start justify-between relative z-10 gap-3">
                          <div className="flex items-start gap-3 w-full">
                            <div className={`p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                              isCompleted
                                ? 'bg-green-500/30'
                                : `bg-gradient-to-br ${task.color} opacity-20`
                            }`}>
                              <TaskIcon className={`w-6 h-6 transition-colors duration-300 ${
                                isCompleted ? 'text-green-400' : 'text-gray-300'
                              }`} />
                            </div>
                            <div className="text-left flex-1">
                              <p className={`font-semibold text-base transition-colors duration-300 ${
                                isCompleted ? 'text-green-300' : 'text-gray-100'
                              }`}>
                                {task.label}
                              </p>
                              <p className="text-sm text-gray-400">+{task.xp} XP</p>
                            </div>
                          </div>
                          
                          {/* Completion checkmark */}
                          <div className="w-full flex justify-end">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                              isCompleted
                                ? 'border-green-400 bg-green-500/20'
                                : 'border-gray-600'
                            }`}>
                              {isCompleted && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <Check className="w-5 h-5 text-green-400" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 bg-gray-800/70 rounded-2xl p-6 border border-gray-700/80 relative overflow-hidden h-full flex flex-col">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_25%,rgba(239,68,68,0.15),transparent_60%)]" />
              <div className="flex items-center justify-between mb-5 relative">
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">Achievements <Award className="w-5 h-5 text-yellow-400" /></h3>
                <span className="text-xs text-gray-400">Earn XP by unlocking milestones</span>
              </div>
              <div className="grid grid-cols-5 grid-rows-4 gap-3 auto-rows-max">
                {ACHIEVEMENTS.slice(0,20).map(a => {
                  // Auto-unlock achievements based on actual KPI data
                  const unlocked = achievementState.unlocked.has(a.id) || 
                    (a.id === 'first-step' && kpis && kpis.totalCheckIns >= 1) ||
                    (a.id === 'week-warrior' && kpis && kpis.streakDays >= 7) ||
                    (a.id === 'month-master' && kpis && kpis.streakDays >= 30) ||
                    (a.id === 'daily-exerciser' && kpis && kpis.exercisesCompleted >= 1) ||
                    (a.id === 'consistency' && kpis && kpis.streakDays >= 3) ||
                    (a.id === 'learner' && completedTasks.has('education'));
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

