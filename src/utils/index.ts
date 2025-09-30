// Date utility functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = getDateDaysAgo(1);
  return formatDate(date) === formatDate(yesterday);
};

export const getDaysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

// Check-in utility functions with icons
export const getMoodIcon = (mood: number): string => {
  const icons = ['frown', 'frown', 'frown', 'meh', 'meh', 'meh', 'smile', 'smile', 'smile', 'smile'];
  return icons[mood - 1] || 'meh';
};

export const getStressManagementIcon = (stressManagement: number): string => {
  const icons = ['frown', 'frown', 'frown', 'meh', 'meh', 'meh', 'smile', 'smile', 'smile', 'smile'];
  return icons[stressManagement - 1] || 'meh';
};

export const getEnergyIcon = (energy: number): string => {
  const icons = ['battery-low', 'battery-low', 'battery-low', 'battery', 'battery', 'battery', 'zap', 'zap', 'zap', 'zap'];
  return icons[energy - 1] || 'battery';
};

export const getMotivationIcon = (motivation: number): string => {
  const icons = ['frown', 'frown', 'meh', 'zap', 'rocket'];
  return icons[motivation - 1] || 'meh';
};

// Legacy emoji functions (deprecated - use icon versions above)
export const getMoodEmoji = (mood: number): string => {
  const labels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
  return labels[mood - 1] || 'Neutral';
};

export const getStressManagementEmoji = (stressManagement: number): string => {
  const labels = ['Very Stressed', 'Stressed', 'Somewhat Stressed', 'Neutral', 'Somewhat Calm', 'Calm', 'Relaxed', 'Very Relaxed', 'Excellent', 'Outstanding'];
  return labels[stressManagement - 1] || 'Neutral';
};

export const getEnergyEmoji = (energy: number): string => {
  const labels = ['Very Low', 'Low', 'Neutral', 'High', 'Very High'];
  return labels[energy - 1] || 'Neutral';
};

export const getMotivationEmoji = (motivation: number): string => {
  const emojis = ['Very Low', 'Low', 'Neutral', 'High', 'Very High'];
  return emojis[motivation - 1] || 'Neutral';
};

export const getScoreColor = (score: number): string => {
  if (score <= 2) return 'text-red-400';
  if (score === 3) return 'text-yellow-400';
  return 'text-green-400';
};

export const getScoreBackgroundColor = (score: number): string => {
  if (score <= 2) return 'bg-red-500';
  if (score === 3) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Streak utility functions
export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Start your journey today!";
  if (streak === 1) return "Great start! Keep it up!";
  if (streak < 7) return `${streak} days strong! Keep going!`;
  if (streak < 30) return `${streak} days streak! Amazing!`;
  return `${streak} days streak! Incredible!`;
};

export const getNextBadgeTarget = (streak: number): { target: number; message: string } => {
  if (streak < 3) return { target: 3, message: "3-day streak badge" };
  if (streak < 7) return { target: 7, message: "1-week streak badge" };
  if (streak < 30) return { target: 30, message: "1-month streak badge" };
  return { target: 365, message: "1-year streak badge" };
};

// XP and Level utility functions
export const calculateXP = (checkInData: { mood: number; stress_management: number; energy: number; motivation: number }): number => {
  const baseXP = 10;
  const bonusXP = Math.max(0, (checkInData.mood + checkInData.stress_management + checkInData.energy + checkInData.motivation) - 20);
  return baseXP + bonusXP;
};

export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 100) + 1;
};

export const getXPForLevel = (level: number): number => {
  return (level - 1) * 100;
};

export const getXPProgress = (totalXP: number): { level: number; currentXP: number; xpForNextLevel: number; progress: number } => {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const currentXP = totalXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progress = (currentXP / xpNeededForNext) * 100;
  
  return {
    level,
    currentXP,
    xpForNextLevel: xpNeededForNext,
    progress: Math.min(progress, 100),
  };
};

// Exercise utility functions
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'text-green-400';
    case 'intermediate': return 'text-yellow-400';
    case 'advanced': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getDifficultyBadgeColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Validation utility functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'strong': return 'text-green-500';
  }
};

// Error message utilities
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Local storage utility functions
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }
};

export const removeFromLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

// Format utility functions
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

// Legacy stress functions (for backwards compatibility)
export const getStressIcon = (stress: number): string => {
  // Convert old 1-5 stress scale to new 1-10 stress management scale
  const stressManagement = 11 - stress * 2; // Invert and scale: 5 -> 1, 1 -> 9
  return getStressManagementIcon(stressManagement);
};

export const getStressEmoji = (stress: number): string => {
  // Convert old 1-5 stress scale to new 1-10 stress management scale  
  const stressManagement = 11 - stress * 2; // Invert and scale: 5 -> 1, 1 -> 9
  return getStressManagementEmoji(stressManagement);
};
