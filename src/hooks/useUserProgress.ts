import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { computeWellbeing } from '@/utils/wellbeing';
import { gamificationService } from '@/services/gamification';

export type Range = '7d' | '30d' | '90d';

function startDateForRange(range: Range) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type KPI = {
  avgWellbeing: number;
  weeklyAvgWellbeing?: number;
  avgMood: number;
  avgStress: number;
  avgEnergy: number;
  avgMotivation: number;
  stressInvAvg: number;
  streakDays: number;
  totalCheckIns: number;
  exercisesCompleted: number;
  xp: number;
  level: number;
  nextLevelXP: number;
  currentLevelXP: number;
  rank: string;
  rankSymbol: string;
};

type Chart = { points: Array<{ date: string; wellbeing: number | null }>; };

type Badge = { badge_key: string; earned_at: string };

type MetricKey = 'mood' | 'stress_management' | 'energy' | 'motivation' | 'confidence' | 'focus' | 'recovery' | 'sleep';

type SeriesPoint = { date: string; value: number | null; rolling7?: number | null };

type SeriesMap = Record<MetricKey, SeriesPoint[]>;

type WeeklyAverages = {
  labels: string[];
  byMetric: Record<MetricKey, number[]>; // parallel to labels
  personalBests: Partial<Record<MetricKey, number>>;
};

type Variations = Partial<Record<MetricKey, { maxSpike: number; maxDrop: number }>>;

type HeatmapData = { xLabels: string[]; yLabels: string[]; cells: Array<{ x: string; y: string; value: number }> };

type Consistency = { percent: number; status: 'Great' | 'Good' | 'Needs attention' };

type Momentum = { direction: '↑' | '↓' | '→'; label: string };

export function useUserProgress(range: Range = '30d') {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [chart, setChart] = useState<Chart>({ points: [] });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [series, setSeries] = useState<SeriesMap | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAverages | null>(null);
  const [variations, setVariations] = useState<Variations | null>(null);
  const [resilience, setResilience] = useState<{ daily: SeriesPoint[]; avg: number } | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [wellbeingProgress, setWellbeingProgress] = useState<{ current: number; target: number; percent: number } | null>(null);
  const [consistency, setConsistency] = useState<Consistency | null>(null);
  const [momentum, setMomentum] = useState<Momentum | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for profile changes in localStorage and daily task completions
  useEffect(() => {
    if (!user?.id) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `profile_${user.id}` || (e.key && e.key.startsWith(`task_${user.id}_`)) || e.key === 'xp_updated') {
        // Profile was updated or task was completed or XP was updated, trigger refresh
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(undefined);
      try {
        const rangeStart = startDateForRange(range);
        const rangeStartIso = rangeStart.toISOString();

        // Check-ins in range with timeout
        const checkinsPromise = supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', formatDate(rangeStart))
          .order('date', { ascending: true });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        );
        
        const { data: checkins, error: ciErr } = await Promise.race([
          checkinsPromise,
          timeoutPromise
        ]) as any;
        
        if (ciErr) {
          console.error('Check-ins query error:', ciErr);
          throw ciErr;
        }

        // Total check-ins all time with timeout
        const countPromise = supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        const { count: totalCheckIns, error: ciCountErr } = await Promise.race([
          countPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
        ]) as any;
        
        if (ciCountErr) {
          console.error('Count query error:', ciCountErr);
          throw ciCountErr;
        }

        // Exercises completed (range)
  const exercisesCompleted = 0; // Placeholder: table not defined yet

        // Badges (latest 6)
  const badgeRows: Badge[] = [];

        // Build per-day map and averages
        const perDay: Record<string, Array<{
          mood: number; stress_management: number; energy: number; motivation?: number; confidence?: number; focus?: number; recovery?: number; sleep?: number;
        }>> = {};
        let sumMood = 0, sumStress = 0, sumEnergy = 0, sumMotivation = 0;

        for (const row of checkins || []) {
          const date = row.date as string;
          perDay[date] = perDay[date] || [];
          perDay[date].push({ 
            mood: row.mood_rating, 
            stress_management: row.stress_management, 
            energy: row.energy_level,
            motivation: (row as any).motivation ?? Math.round((row.mood_rating + row.energy_level) / 2),
            confidence: (row as any).confidence ?? undefined,
            focus: (row as any).focus ?? undefined,
            recovery: (row as any).recovery ?? undefined,
            sleep: (row as any).sleep_hours ?? undefined,
          });
          sumMood += row.mood_rating; sumStress += row.stress_management; sumEnergy += row.energy_level; sumMotivation += ((row as any).motivation ?? (row.mood_rating + row.energy_level) / 2);
        }

        const n = (checkins || []).length || 1;
        const avgMood = sumMood / n;
        const avgStress = sumStress / n;
        const avgEnergy = sumEnergy / n;
        const avgMotivation = sumMotivation / n;
        const stressInvAvg = 100 - ((avgStress - 1) / 9) * 100;

        // chart points with continuous dates
        const points: Array<{ date: string; wellbeing: number | null }> = [];
  const dailySeries: SeriesMap = { mood: [], stress_management: [], energy: [], motivation: [], confidence: [], focus: [], recovery: [], sleep: [] };
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = formatDate(d);
          const items = perDay[key];
          if (!items || items.length === 0) {
            points.push({ date: key, wellbeing: null });
            (Object.keys(dailySeries) as MetricKey[]).forEach(m => dailySeries[m].push({ date: key, value: null }));
          } else {
            const avgRaw = items.reduce((acc, it) => {
              const m = [
                it.mood,
                it.stress_management,
                it.energy,
                (it.motivation ?? Math.round((it.mood + it.energy) / 2)),
                (it.confidence ?? 5),
                (it.focus ?? 5),
                (it.recovery ?? 5),
                (it.sleep ?? 5),
              ];
              const dayMean = m.reduce((a,b)=>a+b,0) / 8;
              return acc + dayMean;
            }, 0) / items.length;
            // Store as 1-10 scale for chart/KPIs (no rounding to keep precision)
            points.push({ date: key, wellbeing: +avgRaw.toFixed(2) });
            // per-metric means
            const mean = (arr: number[]) => arr.reduce((a,b)=>a+b,0)/arr.length;
            const mv = {
              mood: mean(items.map(it => it.mood)),
              stress_management: mean(items.map(it => it.stress_management)),
              energy: mean(items.map(it => it.energy)),
              motivation: mean(items.map(it => (it.motivation ?? (it.mood + it.energy)/2))),
              confidence: items.some(it => it.confidence !== undefined) ? mean(items.filter(it=>it.confidence!==undefined).map(it => it.confidence as number)) : null,
              focus: items.some(it => it.focus !== undefined) ? mean(items.filter(it=>it.focus!==undefined).map(it => it.focus as number)) : null,
              recovery: items.some(it => it.recovery !== undefined) ? mean(items.filter(it=>it.recovery!==undefined).map(it => it.recovery as number)) : null,
              sleep: items.some(it => it.sleep !== undefined) ? mean(items.filter(it=>it.sleep!==undefined).map(it => it.sleep as number)) : null,
              
            } as Record<MetricKey, number | null>;
            (Object.keys(dailySeries) as MetricKey[]).forEach(m => dailySeries[m].push({ date: key, value: (mv[m] ?? null) }));
          }
        }

        // streak: consecutive days from today with >=1 check-in
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = formatDate(d);
          if (perDay[key] && perDay[key].length > 0) streak++; else break;
        }
        // Ensure streak starts at 1 for first-day users
        if (streak === 0) streak = 1;

  const nonNull = points.filter(p => p.wellbeing !== null) as Array<{date:string; wellbeing:number}>;
  // wellbeing stored as 1-10 scale; average across days with recorded scores only
  const avgWellbeing = nonNull.length
    ? +(nonNull.reduce((a, p) => a + (p.wellbeing as number), 0) / nonNull.length).toFixed(2)
    : 0;
  const consistencyPercent = Math.round((nonNull.length / Math.max(1, points.length)) * 100);
  const consistencyStatus: Consistency['status'] = consistencyPercent >= 80 ? 'Great' : consistencyPercent >= 50 ? 'Good' : 'Needs attention';

  // Calculate momentum: compare last 3 points (treating null as 0) vs previous 3 points
  let momentumData: Momentum = { direction: '→', label: 'Steady' };
  if (points.length >= 2) {
    const last3Points = points.slice(-3);
    const prev3Points = points.length >= 6 ? points.slice(-6, -3) : [];
    // Treat null as 0 for momentum calculation
    const last3Values = last3Points.map(p => p.wellbeing ?? 0);
    const prev3Values = prev3Points.map(p => p.wellbeing ?? 0);
    if (last3Values.length > 0) {
      const avgLast3 = last3Values.reduce((a, v) => a + v, 0) / last3Values.length;
      const avgPrev3 = prev3Values.length > 0 ? prev3Values.reduce((a, v) => a + v, 0) / prev3Values.length : avgLast3;
      const diff = avgLast3 - avgPrev3;
      if (Math.abs(diff) < 0.5) {
        momentumData = { direction: '→', label: 'Steady' };
      } else if (diff > 0) {
        momentumData = { direction: '↑', label: `Improving steadily` };
      } else {
        momentumData = { direction: '↓', label: `Declining over last 3 days` };
      }
    }
  }

        // Mental Wellbeing Index (average of all metrics, stress already positive-oriented) kept on 1-10 scale
  const wellbeingPerDay: number[] = [];
  const metricsKeys: MetricKey[] = ['mood','stress_management','energy','motivation','confidence','focus','recovery','sleep'];
        for (let i = 0; i < (dailySeries.mood?.length || 0); i++) {
          let sum = 0; let count = 0;
          metricsKeys.forEach(m => {
            const p = (dailySeries as any)[m][i] as { value: number | null };
            if (p && typeof p.value === 'number') {
              sum += p.value;
              count++;
            }
          });
          if (count > 0) wellbeingPerDay.push(sum / count);
        }
  const mentalIndex = +((wellbeingPerDay.reduce((a,b)=>a+b,0) / Math.max(1, wellbeingPerDay.length)).toFixed(1));
  // Weekly average wellbeing (last 7 days) on 1-10 scale
  const last7 = wellbeingPerDay.slice(-7);
  const weeklyAvgWellbeing = +((last7.reduce((a,b)=>a+b,0) / Math.max(1, last7.length)).toFixed(1));

        // Rolling 7-day averages for each metric
        const withRolling = (arr: SeriesPoint[]): SeriesPoint[] => arr.map((p, idx) => {
          if (p.value === null) return { ...p, rolling7: null };
          let sum = 0, count = 0;
          for (let k = Math.max(0, idx - 6); k <= idx; k++) {
            const v = arr[k].value;
            if (typeof v === 'number') { sum += v; count++; }
          }
          return { ...p, rolling7: count ? +(sum / count).toFixed(2) : null };
        });
        (Object.keys(dailySeries) as MetricKey[]).forEach(m => {
          dailySeries[m] = withRolling(dailySeries[m]);
        });

        // Weekly averages
        const weekOf = (ds: string) => {
          const d = new Date(ds);
          const onejan = new Date(d.getFullYear(),0,1);
          const week = Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getDay() + 1) / 7);
          return `${d.getFullYear()}-W${week.toString().padStart(2,'0')}`;
        };
  const weeksMap: Record<string, { count: number; sums: Record<MetricKey, number>; present: Record<MetricKey, number> }> = {};
        (Object.keys(dailySeries) as MetricKey[]).forEach(m => {
          dailySeries[m].forEach(p => {
            const w = weekOf(p.date);
            weeksMap[w] = weeksMap[w] || { count: 0, sums: { mood:0,stress_management:0,energy:0,motivation:0,confidence:0,focus:0,recovery:0 }, present: { mood:0,stress_management:0,energy:0,motivation:0,confidence:0,focus:0,recovery:0 } } as any;
            if (typeof p.value === 'number') { weeksMap[w].sums[m] += p.value; weeksMap[w].present[m] += 1; }
          });
        });
    const weekLabels = Object.keys(weeksMap).sort();
  const byMetric: Record<MetricKey, number[]> = { mood:[],stress_management:[],energy:[],motivation:[],confidence:[],focus:[],recovery:[],sleep:[] };
        weekLabels.forEach(w => {
          (Object.keys(byMetric) as MetricKey[]).forEach(m => {
            const pres = weeksMap[w].present[m];
            byMetric[m].push(pres ? +(weeksMap[w].sums[m] / pres).toFixed(2) : 0);
          });
        });
        const personalBests: Partial<Record<MetricKey, number>> = {};
        (Object.keys(byMetric) as MetricKey[]).forEach(m => {
          personalBests[m] = byMetric[m].length ? Math.max(...byMetric[m]) : 0;
        });

        // Variations week-over-week
        const variationsCalc: Variations = {};
        (Object.keys(byMetric) as MetricKey[]).forEach(m => {
          let maxSpike = 0, maxDrop = 0;
          for (let i = 1; i < byMetric[m].length; i++) {
            const diff = +(byMetric[m][i] - byMetric[m][i-1]).toFixed(2);
            if (diff > maxSpike) maxSpike = diff;
            if (diff < maxDrop) maxDrop = diff;
          }
          variationsCalc[m] = { maxSpike, maxDrop };
        });

        // Resilience: recovery - stress
        const resilienceDaily: SeriesPoint[] = dailySeries.recovery.map((p, i) => {
          const rec = typeof p.value === 'number' ? p.value : null;
          const sm = typeof dailySeries.stress_management[i].value === 'number' ? dailySeries.stress_management[i].value : null;
          // Higher stress management should increase resilience. Map both to 0-10 scale difference.
          const val = rec !== null && sm !== null ? +((rec + sm) / 2).toFixed(2) : null;
          return { date: p.date, value: val };
        });
        const resilienceAvg = +(resilienceDaily.filter(p => typeof p.value === 'number').reduce((a,p)=>a+(p.value as number),0) / Math.max(1, resilienceDaily.filter(p => typeof p.value === 'number').length)).toFixed(2);

        // Heatmap (calendar by week x weekday) with overall wellbeing scaled to 1-10
        const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const heatWeeks = new Set<string>();
        nonNull.forEach(p => heatWeeks.add(weekOf(p.date)));
        const xLabels = Array.from(heatWeeks).sort();
        const yLabels = weekday;
        const cells: Array<{ x: string; y: string; value: number }> = [];
        nonNull.forEach(p => {
          const w = weekOf(p.date);
          const d = new Date(p.date);
          const y = weekday[d.getDay()];
          // wellbeing already on 1-10 scale
          const v = Math.max(1, Math.min(10, Math.round(p.wellbeing)));
          cells.push({ x: w, y, value: v });
        });

        if (!cancelled) {
          // Fetch real profile XP/level from Supabase or localStorage
          let xp = 0;
          if (user?.id) {
            try {
              // Try Supabase first
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('total_xp, current_level')
                .eq('id', user.id)
                .single();
              
              if (profile && !error) {
                xp = profile.total_xp || 0;
              } else {
                // Fallback to localStorage (demo mode)
                const localProfile = localStorage.getItem(`profile_${user.id}`);
                if (localProfile) {
                  const parsed = JSON.parse(localProfile);
                  xp = parsed.xp || 0;
                }
              }
              // Prefer the larger of Supabase and local XP to avoid UI reset when DB is behind
              try {
                const lp = localStorage.getItem(`profile_${user.id}`);
                if (lp) {
                  const parsed = JSON.parse(lp);
                  const localXp = parsed.xp || 0;
                  const beforeMax = xp;
                  xp = Math.max(xp, localXp);
                  console.log(`[useUserProgress] XP: Supabase=${beforeMax}, Local=${localXp}, Final=${xp}`);
                }
              } catch {}
            } catch (e) {
              // Fallback to localStorage on error
              const localProfile = localStorage.getItem(`profile_${user.id}`);
              if (localProfile) {
                const parsed = JSON.parse(localProfile);
                xp = parsed.xp || 0;
              }
              console.error('Error fetching XP/level:', e);
            }
          }
          const { level, currentThreshold: currentLevelXP, nextThreshold: nextLevelXP } = gamificationService.getRankProgress(xp);
          // Rank mapping
          const rankTiers = [
            { name: 'Bronze', symbol: '🥉', min: 1 },
            { name: 'Silver', symbol: '🥈', min: 3 },
            { name: 'Gold', symbol: '🥇', min: 5 },
            { name: 'Platinum', symbol: '⛏️', min: 7 },
            { name: 'Diamond', symbol: '💎', min: 9 },
            { name: 'Champion', symbol: '🏆', min: 11 },
            { name: 'Elite', symbol: '🔥', min: 13 },
          ];
          const currentRank = [...rankTiers].reverse().find(r => level >= r.min) || rankTiers[0];

          setKpis({
            avgWellbeing,
            weeklyAvgWellbeing,
            avgMood,
            avgStress,
            avgEnergy,
            avgMotivation,
            stressInvAvg,
            streakDays: streak,
            totalCheckIns: totalCheckIns || 0,
            exercisesCompleted: exercisesCompleted || 0,
            xp,
            level,
            nextLevelXP,
            currentLevelXP,
            rank: currentRank.name,
            rankSymbol: currentRank.symbol,
          });
          setChart({ points });
          setBadges(badgeRows || []);
          setSeries(dailySeries);
          setWeekly({ labels: weekLabels, byMetric, personalBests });
          setVariations(variationsCalc);
          setResilience({ daily: resilienceDaily, avg: resilienceAvg });
          setHeatmap({ xLabels, yLabels, cells });
          const target = 10;
          const percent = Math.min(100, Math.round((avgWellbeing / target) * 100));
          setWellbeingProgress({ current: avgWellbeing, target, percent });
          setConsistency({ percent: consistencyPercent, status: consistencyStatus });
          setMomentum(momentumData);
        }
      } catch (e: any) {
        console.error('useUserProgress error:', e);
        if (!cancelled) {
          // Provide fallback empty state on timeout/error instead of breaking UI
          setError(e.message || 'Failed to load progress');
          setKpis({
            avgWellbeing: 0,
            weeklyAvgWellbeing: 0,
            avgMood: 0,
            avgStress: 0,
            avgEnergy: 0,
            avgMotivation: 0,
            stressInvAvg: 0,
            streakDays: 0,
            totalCheckIns: 0,
            exercisesCompleted: 0,
            xp: 0,
            level: 1,
            nextLevelXP: 120,
            currentLevelXP: 0,
            rank: 'Bronze',
            rankSymbol: '🥉',
          });
          setChart({ points: [] });
          setConsistency(null);
          setMomentum(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    // Re-run when range, user, or profile changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, range, refreshTrigger]);

  return { isLoading, error, kpis, chart, badges, series, weekly, variations, resilience, heatmap, wellbeingProgress, consistency, momentum };
}
