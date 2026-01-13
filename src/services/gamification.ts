import { auth, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { UserProfile, CheckInDocument, CompletedExerciseDocument, CompletedEducationDocument } from '@/types';
import { updateUserProfile, logDailyTask, logAchievement } from '../../lib/supabase/database';

export interface UserStats {
  userId: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
  streakFreezeTokens: number;
  badges: Badge[];
  activities: ActivityRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'xp' | 'completion' | 'special';
  unlockedAt: Date;
  xpReward: number;
}

export interface ActivityRecord {
  id: string;
  type: 'check-in' | 'exercise' | 'education' | 'badge-unlock';
  description: string;
  xpGained: number;
  timestamp: Date;
  metadata?: any;
}

// XP amounts for different activities
export const XP_REWARDS = {
  // Core daily actions - matching daily task XP values
  DAILY_CHECKIN: 50,              // Daily Check-in task
  LOGIN_DAILY: 0,                 // No XP for login (use daily task instead)
  EXERCISE_COMPLETION: 30,        // Do an Exercise task
  EDUCATION_COMPLETION: 25,       // View Education task
  EXERCISE_VIEW: 0,               // No XP for just viewing
  RESOURCE_VIEW: 20,              // Check a Resource task

  // Streak bonuses (multipliers on habit formation)
  STREAK_BONUS_3_DAYS: 0,
  STREAK_BONUS_7_DAYS: 0,
  STREAK_BONUS_30_DAYS: 0,

  // One‑time starter / milestone
  FIRST_TIME_BONUS: 0,
};

// Level progression (XP required for each level)
// Progression curve: fast early onboarding (ranks 1-3), moderate mid, widening later.
export const LEVEL_THRESHOLDS = [
  0,     // 1 Bronze I
  120,   // 2 Bronze II
  300,   // 3 Bronze III
  550,   // 4 Silver I
  900,   // 5 Silver II
  1300,  // 6 Silver III
  1800,  // 7 Gold I
  2400,  // 8 Gold II
  3100,  // 9 Gold III
  3900,  // 10 Platinum I
  4800,  // 11 Platinum II
  5800,  // 12 Platinum III
  6900,  // 13 Diamond I
  8100,  // 14 Diamond II
  9400,  // 15 Diamond III
  10800, // 16 Elite I
  12300, // 17 Elite II
  13900, // 18 Elite III
  15600, // 19 Champion I
  17400, // 20 Champion II
  19300, // 21 Champion III
];

// Rank titles & tiers (can extend later). Keep index aligned with level (1-based).
// Suggested progression theme: Bronze (1-3), Silver (4-6), Gold (7-9), Platinum (10-12), Diamond (13-15)
export interface RankMeta { title: string; tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite' | 'champion'; color: string; }
export const RANKS: RankMeta[] = [
  { title: 'Bronze I', tier: 'bronze', color: '#cd7f32' },   // 1
  { title: 'Bronze II', tier: 'bronze', color: '#cd7f32' },  // 2
  { title: 'Bronze III', tier: 'bronze', color: '#cd7f32' }, // 3
  { title: 'Silver I', tier: 'silver', color: '#c0c0c0' },   // 4
  { title: 'Silver II', tier: 'silver', color: '#c0c0c0' },  // 5
  { title: 'Silver III', tier: 'silver', color: '#c0c0c0' }, // 6
  { title: 'Gold I', tier: 'gold', color: '#ffd700' },       // 7
  { title: 'Gold II', tier: 'gold', color: '#ffd700' },      // 8
  { title: 'Gold III', tier: 'gold', color: '#ffd700' },     // 9
  { title: 'Platinum I', tier: 'platinum', color: '#9ad5ff' },  // 10
  { title: 'Platinum II', tier: 'platinum', color: '#9ad5ff' }, // 11
  { title: 'Platinum III', tier: 'platinum', color: '#9ad5ff' },// 12
  { title: 'Diamond I', tier: 'diamond', color: '#6ae3ff' },    // 13
  { title: 'Diamond II', tier: 'diamond', color: '#6ae3ff' },   // 14
  { title: 'Diamond III', tier: 'diamond', color: '#6ae3ff' },  // 15
  { title: 'Elite I', tier: 'elite', color: '#ff5fa2' },        // 16
  { title: 'Elite II', tier: 'elite', color: '#ff5fa2' },       // 17
  { title: 'Elite III', tier: 'elite', color: '#ff5fa2' },      // 18
  { title: 'Champion I', tier: 'champion', color: '#ff2d55' },  // 19
  { title: 'Champion II', tier: 'champion', color: '#ff2d55' }, // 20
  { title: 'Champion III', tier: 'champion', color: '#ff2d55' },// 21
];

export const getRankMeta = (level: number): RankMeta => {
  return RANKS[Math.min(Math.max(level, 1), RANKS.length) - 1];
};

// Achievement model (expanded to resources, education, exercises, login streaks, totals)
export interface AchievementDef {
  id: string;
  group: 'streak' | 'login' | 'exercise' | 'resource' | 'education' | 'xp' | 'checkins';
  target: number;       // numeric target
  xp: number;           // xp reward when unlocked
  icon: string;         // lucide icon name
  label: string;        // short label
  description: string;  // tooltip style text
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Check-in streaks (primary daily task)
  { id: 'checkin-streak-3', group: 'checkins', target: 3, xp: 50, icon: 'calendar', label: '3 Check-ins', description: '3 consecutive daily check-ins.' },
  { id: 'checkin-streak-7', group: 'checkins', target: 7, xp: 125, icon: 'calendar-days', label: 'Week Consistent', description: '7 consecutive daily check-ins.' },
  { id: 'checkin-streak-14', group: 'checkins', target: 14, xp: 200, icon: 'calendar-range', label: 'Fortnight Strong', description: '14 consecutive daily check-ins.' },
  { id: 'checkin-streak-30', group: 'checkins', target: 30, xp: 400, icon: 'flame', label: 'Monthly Dedicated', description: '30 consecutive daily check-ins.' },
  // Exercises completed
  { id: 'ex-1', group: 'exercise', target: 1, xp: 15, icon: 'zap', label: 'First Exercise', description: 'Complete 1 exercise.' },
  { id: 'ex-5', group: 'exercise', target: 5, xp: 50, icon: 'activity', label: '5 Exercises', description: 'Complete 5 exercises.' },
  { id: 'ex-10', group: 'exercise', target: 10, xp: 100, icon: 'pulse', label: '10 Exercises', description: 'Complete 10 exercises.' },
  { id: 'ex-20', group: 'exercise', target: 20, xp: 200, icon: 'dumbbell', label: '20 Exercises', description: 'Complete 20 exercises.' },
  { id: 'ex-50', group: 'exercise', target: 50, xp: 450, icon: 'trophy', label: '50 Exercises', description: 'Complete 50 exercises.' },
  { id: 'ex-100', group: 'exercise', target: 100, xp: 900, icon: 'medal', label: '100 Exercises', description: 'Complete 100 exercises.' },
  // Resources viewed
  { id: 'res-1', group: 'resource', target: 1, xp: 12, icon: 'book-open', label: 'First Resource', description: 'View 1 resource.' },
  { id: 'res-5', group: 'resource', target: 5, xp: 40, icon: 'book-marked', label: '5 Resources', description: 'View 5 resources.' },
  { id: 'res-10', group: 'resource', target: 10, xp: 80, icon: 'library', label: '10 Resources', description: 'View 10 resources.' },
  { id: 'res-20', group: 'resource', target: 20, xp: 160, icon: 'layers', label: '20 Resources', description: 'View 20 resources.' },
  { id: 'res-50', group: 'resource', target: 50, xp: 350, icon: 'archive', label: '50 Resources', description: 'View 50 resources.' },
  { id: 'res-100', group: 'resource', target: 100, xp: 700, icon: 'vault', label: '100 Resources', description: 'View 100 resources.' },
  // Education pieces
  { id: 'edu-1', group: 'education', target: 1, xp: 13, icon: 'brain', label: 'First Lesson', description: 'View 1 education item.' },
  { id: 'edu-5', group: 'education', target: 5, xp: 45, icon: 'lightbulb', label: '5 Lessons', description: 'View 5 education items.' },
  { id: 'edu-10', group: 'education', target: 10, xp: 90, icon: 'graduation-cap', label: '10 Lessons', description: 'View 10 education items.' },
  { id: 'edu-20', group: 'education', target: 20, xp: 180, icon: 'scroll', label: '20 Lessons', description: 'View 20 education items.' },
  { id: 'edu-50', group: 'education', target: 50, xp: 400, icon: 'books', label: '50 Lessons', description: 'View 50 education items.' },
  { id: 'edu-100', group: 'education', target: 100, xp: 800, icon: 'university', label: '100 Lessons', description: 'View 100 education items.' },
];

interface AchievementProgressState {
  unlocked: string[];
}

// Local storage helpers for achievements (demo mode)
const getAchievementState = (userId: string): AchievementProgressState => {
  try {
    const raw = localStorage.getItem(`ach_state_${userId}`);
    if (!raw) return { unlocked: [] };
    return JSON.parse(raw);
  } catch {
    return { unlocked: [] };
  }
};

const saveAchievementState = (userId: string, state: AchievementProgressState) => {
  try { localStorage.setItem(`ach_state_${userId}`, JSON.stringify(state)); } catch { /* ignore */ }
};

// Define available badges (using icon names instead of emojis)
export const AVAILABLE_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'welcome',
    name: 'Welcome Aboard',
    description: 'Complete your first check-in',
    icon: 'star',
    category: 'completion',
    xpReward: 50,
  },
  {
    id: 'streak-3',
    name: '3-Day Warrior',
    description: 'Complete check-ins for 3 days in a row',
    icon: 'flame',
    category: 'streak',
    xpReward: 25,
  },
  {
    id: 'streak-7',
    name: 'Week Champion',
    description: 'Complete check-ins for 7 days in a row',
    icon: 'trophy',
    category: 'streak',
    xpReward: 50,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Complete check-ins for 30 days in a row',
    icon: 'crown',
    category: 'streak',
    xpReward: 100,
  },
  {
    id: 'exercise-master',
    name: 'Exercise Master',
    description: 'Complete 10 mental exercises',
    icon: 'zap',
    category: 'completion',
    xpReward: 75,
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Read 5 education articles',
    icon: 'book',
    category: 'completion',
    xpReward: 75,
  },
  {
    id: 'rank-5',
    name: 'Rising Star',
    description: 'Reach Rank 5 (Silver II)',
    icon: 'award',
    category: 'xp',
    xpReward: 100,
  },
  {
    id: 'rank-10',
    name: 'Mental Athlete',
    description: 'Reach Rank 10 (Platinum I)',
    icon: 'rocket',
    category: 'xp',
    xpReward: 200,
  },
];

class GamificationService {
  // Daily login handling (separate from check-in). Awards daily login XP once per calendar day and updates login streak.
  async recordDailyLogin(userId: string): Promise<{ awarded: boolean; streak: number; longest?: number; } | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Demo / local mode
      if (!auth || !db) {
        const lastDateKey = `login_last_${userId}`;
        const streakKey = `login_streak_${userId}`;
        const longestKey = `login_streak_longest_${userId}`;
        const last = localStorage.getItem(lastDateKey);
        let streak = parseInt(localStorage.getItem(streakKey) || '0', 10) || 0;
        let longest = parseInt(localStorage.getItem(longestKey) || '0', 10) || 0;

        if (last === today) {
          // Already processed today
          return { awarded: false, streak, longest };
        }

        const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
        if (last === yesterday) streak += 1; else streak = 1;
        if (streak > longest) longest = streak;

        localStorage.setItem(lastDateKey, today);
        localStorage.setItem(streakKey, String(streak));
        localStorage.setItem(longestKey, String(longest));

        // Award once per day
        await this.awardXP(userId, XP_REWARDS.LOGIN_DAILY, 'check-in', 'Daily login');
        return { awarded: true, streak, longest };
      }

      // Firestore mode
      const docRef = doc(db, 'users', userId, 'loginStats', 'daily');
      const snap = await getDoc(docRef);
      let data: any = snap.exists() ? snap.data() : null;
      const last: string | null = data?.lastLoginDate || null;
      let streak: number = data?.streak || 0;
      let longest: number = data?.longestStreak || 0;

      if (last === today) {
        return { awarded: false, streak, longest };
      }
      const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
      if (last === yesterday) streak += 1; else streak = 1;
      if (streak > longest) longest = streak;

      await setDoc(docRef, {
        lastLoginDate: today,
        streak,
        longestStreak: longest,
        updatedAt: Timestamp.fromDate(new Date()),
      }, { merge: true });

      await this.awardXP(userId, XP_REWARDS.LOGIN_DAILY, 'check-in', 'Daily login');
      return { awarded: true, streak, longest };
    } catch (e) {
      console.error('recordDailyLogin error', e);
      return null;
    }
  }
  // Get user profile from Firestore
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!auth || !db) {
      // Demo mode - return demo profile from localStorage
      const demoProfile = localStorage.getItem(`profile_${userId}`);
      if (demoProfile) {
        const parsed = JSON.parse(demoProfile);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        };
      }
      
      // Create initial demo profile
      const initialProfile: UserProfile = {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      localStorage.setItem(`profile_${userId}`, JSON.stringify(initialProfile));
      return initialProfile;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId, 'profile', 'data'));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }
      
      // Create initial profile if it doesn't exist
      const initialProfile: UserProfile = {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', userId, 'profile', 'data'), {
        ...initialProfile,
        createdAt: Timestamp.fromDate(initialProfile.createdAt),
        updatedAt: Timestamp.fromDate(initialProfile.updatedAt),
      });
      
      return initialProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Award XP and update profile
  async awardXP(userId: string, xpAmount: number, activityType: string, description: string, metadata?: any): Promise<UserProfile | null> {
    try {
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) return null;

      const newXP = currentProfile.xp + xpAmount;
      const newLevel = this.calculateLevel(newXP);
      const levelChanged = newLevel > currentProfile.level;

      const updatedProfile: UserProfile = {
        ...currentProfile,
        xp: newXP,
        level: newLevel,
        updatedAt: new Date(),
      };

      // Check for new badges (including XP-based)
      const newBadges = this.checkForNewBadges(updatedProfile, currentProfile);
      if (newBadges.length > 0) {
        updatedProfile.badges = [...updatedProfile.badges, ...newBadges.map(b => b.id)];
        // Award XP for each badge unlock
        for (const b of newBadges) {
          updatedProfile.xp += b.xpReward;
          // Log achievement to Supabase
          try {
            await logAchievement(b.id, b.xpReward);
          } catch (e) {
            console.warn('Failed to log achievement to Supabase:', e);
          }
        }
        // Recalculate level after badge XP
        updatedProfile.level = this.calculateLevel(updatedProfile.xp);
      }

      // Log daily task if applicable
      if (activityType === 'check-in' && xpAmount > 0) {
        try {
          await logDailyTask('checkin', xpAmount);
        } catch (e) {
          console.warn('Failed to log daily task to Supabase:', e);
        }
      } else if (activityType === 'exercise' && xpAmount > 0) {
        try {
          await logDailyTask('exercise', xpAmount);
        } catch (e) {
          console.warn('Failed to log daily task to Supabase:', e);
        }
      } else if (activityType === 'education' && xpAmount > 0) {
        try {
          await logDailyTask('education', xpAmount);
        } catch (e) {
          console.warn('Failed to log daily task to Supabase:', e);
        }
      }

      if (!auth || !db) {
        // Demo mode - persist profile & activities
        localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
        activities.push({ id: crypto.randomUUID?.() || Date.now().toString(), type: activityType, description, xpGained: xpAmount, timestamp: new Date().toISOString(), metadata });
        localStorage.setItem(`activities_${userId}`, JSON.stringify(activities));
        
        // Also sync to Supabase in demo mode
        try {
          await updateUserProfile({
            total_xp: updatedProfile.xp,
            current_level: updatedProfile.level,
            badges: updatedProfile.badges,
          });
        } catch (e) {
          console.warn('Failed to sync profile to Supabase:', e);
        }
        
        return updatedProfile;
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', userId, 'profile', 'data'), {
        xp: updatedProfile.xp,
        level: updatedProfile.level,
        badges: updatedProfile.badges,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Also sync to Supabase
      try {
        await updateUserProfile({
          total_xp: updatedProfile.xp,
          current_level: updatedProfile.level,
          badges: updatedProfile.badges,
        });
      } catch (e) {
        console.warn('Failed to sync profile to Supabase:', e);
      }

      // Log activity record
      await addDoc(collection(db, 'users', userId, 'activities'), {
        type: activityType,
        description,
        xpGained: xpAmount,
        metadata: metadata || null,
        createdAt: serverTimestamp(),
      });

      return updatedProfile;
    } catch (error) {
      console.error('Error awarding XP:', error);
      return null;
    }
  }

  // Update exercise completion
  async updateExerciseCompletion(userId: string, exerciseId: string): Promise<void> {
    try {
      if (!auth || !db) {
        // Demo mode - save to localStorage
        const completedExercises = JSON.parse(localStorage.getItem(`completed_exercises_${userId}`) || '{}');
        const today = new Date().toISOString().split('T')[0];
        const last = completedExercises[exerciseId];
        if (last === today) return; // already credited today
        completedExercises[exerciseId] = today;
        localStorage.setItem(`completed_exercises_${userId}`, JSON.stringify(completedExercises));
        await this.awardXP(userId, XP_REWARDS.EXERCISE_COMPLETION, 'exercise', 'Exercise completed', { exerciseId });
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      // Deterministic doc id per exercise per day to enforce single award
      const docRef = doc(db, 'users', userId, 'completedExercises', `${exerciseId}_${today}`);
      const existing = await getDoc(docRef);
      if (existing.exists()) return; // already recorded today

      await setDoc(docRef, {
        exerciseId,
        completedAt: Timestamp.fromDate(new Date()),
        date: today,
        xpAwarded: XP_REWARDS.EXERCISE_COMPLETION,
      });
      await this.awardXP(userId, XP_REWARDS.EXERCISE_COMPLETION, 'exercise', 'Exercise completed', { exerciseId });
    } catch (error) {
      console.error('Error updating exercise completion:', error);
    }
  }

  // Update streak after check-in
  async updateStreak(userId: string, checkInDate: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return null;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let newStreak = profile.streak;
      
      if (profile.lastCheckInDate === yesterday) {
        // Continuing streak
        newStreak = profile.streak + 1;
      } else if (profile.lastCheckInDate === today) {
        // Already checked in today
        newStreak = profile.streak;
      } else {
        // Streak broken or starting new
        newStreak = 1;
      }

      const updatedProfile: UserProfile = {
        ...profile,
        streak: newStreak,
        lastCheckInDate: checkInDate,
        updatedAt: new Date(),
      };

      if (!auth || !db) {
        // Demo mode
        localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        return updatedProfile;
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', userId, 'profile', 'data'), {
        streak: newStreak,
        lastCheckInDate: checkInDate,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return updatedProfile;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }

  // Calculate level from XP
  calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Evaluate achievements dynamically (demo mode only for now). Firestore variant can be added similarly.
  async evaluateAchievements(userId: string) {
    try {
      const state = getAchievementState(userId);
      const newlyUnlocked: AchievementDef[] = [];

      // Gather simple counts from existing local storage keys
      const today = new Date().toISOString().split('T')[0]; // reserved if needed

      // Exercise completions count (unique exerciseId occurrences overall)
      let exerciseCount = 0;
      try {
        const completedExercisesRaw = localStorage.getItem(`completed_exercises_${userId}`);
        if (completedExercisesRaw) {
          const obj = JSON.parse(completedExercisesRaw);
          exerciseCount = Object.keys(obj).length; // counts distinct exercises ever completed at least once
        }
      } catch { /* ignore */ }

      // Exercise views (approx by key set size)
      let exerciseViews = 0;
      try {
        const exViewRaw = localStorage.getItem(`exercise_view_${userId}`);
        if (exViewRaw) {
          const obj = JSON.parse(exViewRaw); exerciseViews = Object.keys(obj).length;
        }
      } catch {}

      // Resource views
      let resourceViews = 0;
      try {
        const resRaw = localStorage.getItem(`resource_access_${userId}`);
        if (resRaw) { const obj = JSON.parse(resRaw); resourceViews = Object.keys(obj).length; }
      } catch {}

      // Education views
      let eduViews = 0;
      try {
        const eduRaw = localStorage.getItem(`edu_access_${userId}`);
        if (eduRaw) { const obj = JSON.parse(eduRaw); eduViews = Object.keys(obj).length; }
      } catch {}

      // Login streak
      let loginStreak = 0;
      try { loginStreak = parseInt(localStorage.getItem(`login_streak_${userId}`) || '0', 10) || 0; } catch {}

      // Iterate achievements
      for (const def of ACHIEVEMENTS) {
        if (state.unlocked.includes(def.id)) continue;
        let currentValue = 0;
        switch (def.group) {
          case 'exercise': currentValue = exerciseCount; break;
          case 'resource': currentValue = resourceViews; break;
          case 'education': currentValue = eduViews; break;
          case 'login': currentValue = loginStreak; break;
          default: currentValue = 0; break;
        }
        if (currentValue >= def.target) {
          state.unlocked.push(def.id);
          newlyUnlocked.push(def);
          // Award XP for achievement
          await this.awardXP(userId, def.xp, 'badge-unlock', `Achievement unlocked: ${def.label}`, { achievementId: def.id });
        }
      }

      saveAchievementState(userId, state);
      return newlyUnlocked;
    } catch (e) {
      console.error('evaluateAchievements error', e);
      return [];
    }
  }

  // Calculate XP needed for next level
  getXPForNextLevel(level: number): number {
    // level is 0-based index? existing callers pass (level) or (level-1). We'll provide safe access.
    if (level < 0) return LEVEL_THRESHOLDS[0];
    return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  }

  getLevelProgress(xp: number) {
    const level = this.calculateLevel(xp); // 1-based
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const span = Math.max(1, nextThreshold - currentThreshold);
    const progressed = xp - currentThreshold;
    const percent = Math.min(100, Math.max(0, (progressed / span) * 100));
    return { level, currentThreshold, nextThreshold, progressed, span, percent };
  }

  getRankProgress(xp: number) {
    return this.getLevelProgress(xp); // semantic alias for clarity in UI
  }

  // Check for new badges
  checkForNewBadges(newProfile: UserProfile, oldProfile: UserProfile): Badge[] {
    const newBadges: Badge[] = [];
    
    for (const badgeTemplate of AVAILABLE_BADGES) {
      // Skip if already unlocked
      if (oldProfile.badges.includes(badgeTemplate.id)) continue;
      
      let shouldUnlock = false;
      
      switch (badgeTemplate.id) {
        case 'welcome':
          shouldUnlock = true; // First check-in
          break;
        case 'streak-3':
          shouldUnlock = newProfile.streak >= 3;
          break;
        case 'streak-7':
          shouldUnlock = newProfile.streak >= 7;
          break;
        case 'streak-30':
          shouldUnlock = newProfile.streak >= 30;
          break;
        case 'level-5':
          shouldUnlock = newProfile.level >= 5;
          break;
        case 'level-10':
          shouldUnlock = newProfile.level >= 10;
          break;
        case 'exercise-master':
          try {
            const exRaw = localStorage.getItem('completed_exercises_demo');
            const ex = exRaw ? JSON.parse(exRaw) : {};
            shouldUnlock = Object.keys(ex).length >= 10;
          } catch { shouldUnlock = false; }
          break;
        case 'knowledge-seeker':
          try {
            const eduRaw = localStorage.getItem('edu_access_demo');
            const edu = eduRaw ? JSON.parse(eduRaw) : {};
            shouldUnlock = Object.keys(edu).length >= 5;
          } catch { shouldUnlock = false; }
          break;
      }
      
      if (shouldUnlock) {
        newBadges.push({
          ...badgeTemplate,
          unlockedAt: new Date(),
        });
      }
    }
    
    return newBadges;
  }

  // Get badge by ID
  getBadgeById(badgeId: string): Badge | null {
    const badgeTemplate = AVAILABLE_BADGES.find(b => b.id === badgeId);
    if (!badgeTemplate) return null;
    
    return {
      ...badgeTemplate,
      unlockedAt: new Date(), // This would come from user data
    };
  }

  // Mark education content accessed (award XP once per day per item)
  async recordEducationAccess(userId: string, educationId: string) {
    try {
      const key = `edu_access_${userId}`;
      if (!auth || !db) {
        const accesses = JSON.parse(localStorage.getItem(key) || '{}');
        const today = new Date().toISOString().split('T')[0];
        const last = accesses[educationId];
        if (last === today) return; // already counted today
        accesses[educationId] = today;
        localStorage.setItem(key, JSON.stringify(accesses));
        await this.awardXP(userId, XP_REWARDS.EDUCATION_COMPLETION, 'education', 'Education item viewed', { educationId });
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'users', userId, 'educationAccess', educationId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const lastDate = data.lastAccessDate;
        if (lastDate === today) return; // already counted today
        await updateDoc(docRef, { lastAccessDate: today });
      } else {
        await setDoc(docRef, { lastAccessDate: today, firstAccess: today });
      }
      await this.awardXP(userId, XP_REWARDS.EDUCATION_COMPLETION, 'education', 'Education item viewed', { educationId });
    } catch (e) {
      console.error('recordEducationAccess error', e);
    }
  }

  // Mark resource access (smaller XP, reuse EDUCATION_COMPLETION or adjust)
  async recordResourceAccess(userId: string, resourceId: string) {
    try {
      const keyRoot = 'resource_access';
      const today = new Date().toISOString().split('T')[0];
      if (!auth || !db) {
        const key = `${keyRoot}_${userId}`;
        const accesses = JSON.parse(localStorage.getItem(key) || '{}');
        if (accesses[resourceId] === today) return;
        accesses[resourceId] = today;
        localStorage.setItem(key, JSON.stringify(accesses));
        await this.awardXP(userId, XP_REWARDS.RESOURCE_VIEW, 'education', 'Resource viewed', { resourceId });
        return;
      }
      const docRef = doc(db, 'users', userId, 'resourceAccess', resourceId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.lastAccessDate === today) return;
        await updateDoc(docRef, { lastAccessDate: today });
      } else {
        await setDoc(docRef, { lastAccessDate: today, firstAccess: today });
      }
      await this.awardXP(userId, XP_REWARDS.RESOURCE_VIEW, 'education', 'Resource viewed', { resourceId });
    } catch (e) {
      console.error('recordResourceAccess error', e);
    }
  }

  // Exercise view access (open/start) once per day for small XP
  async recordExerciseAccess(userId: string, exerciseId: string) {
    try {
      const keyRoot = 'exercise_view';
      const today = new Date().toISOString().split('T')[0];
      if (!auth || !db) {
        const key = `${keyRoot}_${userId}`;
        const accesses = JSON.parse(localStorage.getItem(key) || '{}');
        if (accesses[exerciseId] === today) return;
        accesses[exerciseId] = today;
        localStorage.setItem(key, JSON.stringify(accesses));
        await this.awardXP(userId, XP_REWARDS.EXERCISE_VIEW, 'exercise', 'Exercise opened', { exerciseId });
        return;
      }
      const docRef = doc(db, 'users', userId, 'exerciseViews', exerciseId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.lastAccessDate === today) return;
        await updateDoc(docRef, { lastAccessDate: today });
      } else {
        await setDoc(docRef, { lastAccessDate: today, firstAccess: today });
      }
      await this.awardXP(userId, XP_REWARDS.EXERCISE_VIEW, 'exercise', 'Exercise opened', { exerciseId });
    } catch (e) {
      console.error('recordExerciseAccess error', e);
    }
  }
}

export const gamificationService = new GamificationService();
