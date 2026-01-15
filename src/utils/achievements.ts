import { ACHIEVEMENTS } from '@/services/gamification';

interface UnlockedAchievementsState {
  unlocked: string[];
}

// Get stored achievement state from localStorage
export function getAchievementState(userId: string): UnlockedAchievementsState {
  try {
    const raw = localStorage.getItem(`ach_state_${userId}`);
    if (!raw) return { unlocked: [] };
    return JSON.parse(raw);
  } catch {
    return { unlocked: [] };
  }
}

// Save achievement state to localStorage
export function saveAchievementState(userId: string, state: UnlockedAchievementsState): void {
  try {
    localStorage.setItem(`ach_state_${userId}`, JSON.stringify(state));
  } catch {}
}

// Check if achievement should be unlocked and return newly unlocked ones
export async function checkAndUnlockAchievements(
  userId: string,
  counts: {
    checkinsStreak?: number;
    exercisesCompleted?: number;
    resourcesViewed?: number;
    educationViewed?: number;
  }
): Promise<Array<{ id: string; label: string; xp: number }>> {
  if (!userId) return [];

  const state = getAchievementState(userId);
  const newlyUnlocked: Array<{ id: string; label: string; xp: number }> = [];

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (state.unlocked.includes(achievement.id)) continue;

    let currentValue = 0;
    switch (achievement.group) {
      case 'checkins':
        currentValue = counts.checkinsStreak || 0;
        break;
      case 'exercise':
        currentValue = counts.exercisesCompleted || 0;
        break;
      case 'resource':
        currentValue = counts.resourcesViewed || 0;
        break;
      case 'education':
        currentValue = counts.educationViewed || 0;
        break;
      default:
        currentValue = 0;
    }

    // Check if achievement target is met
    if (currentValue >= achievement.target) {
      state.unlocked.push(achievement.id);
      newlyUnlocked.push({
        id: achievement.id,
        label: achievement.label,
        xp: achievement.xp,
      });

      // Call API to unlock achievement and award XP
      try {
        await fetch('/api/supabase/unlock-achievement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievementId: achievement.id,
            xpReward: achievement.xp,
          }),
        }).then(() => {
          // Bump local profile XP for immediate UI update
          try {
            const key = `profile_${userId}`;
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : {};
            const currentXp = parsed.xp || 0;
            parsed.xp = currentXp + achievement.xp;
            localStorage.setItem(key, JSON.stringify(parsed));
          } catch {}
          // Trigger refresh of user progress
          setTimeout(() => {
            window.dispatchEvent(new StorageEvent('storage', { key: 'xp_updated' }));
          }, 100);
        }).catch(err => console.error(`Failed to unlock achievement ${achievement.id}:`, err));
      } catch (err) {
        console.error(`Error unlocking achievement ${achievement.id}:`, err);
      }
    }
  }

  // Save updated state
  if (newlyUnlocked.length > 0) {
    saveAchievementState(userId, state);
  }

  return newlyUnlocked;
}

// Get the count of a specific item type
export function getItemCount(userId: string, itemType: 'exercise' | 'resource' | 'education'): number {
  try {
    const key = `${itemType}_${userId}_completed`;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
  } catch {
    return 0;
  }
}

// Track item completion
export function trackItemCompletion(userId: string, itemType: 'exercise' | 'resource' | 'education', itemId: string): void {
  try {
    const key = `${itemType}_${userId}_completed`;
    const stored = localStorage.getItem(key);
    let items: string[] = [];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        items = Array.isArray(parsed) ? parsed : Object.keys(parsed);
      } catch {
        items = [];
      }
    }
    
    // Add if not already present
    if (!items.includes(itemId)) {
      items.push(itemId);
      localStorage.setItem(key, JSON.stringify(items));
    }
  } catch {}
}
