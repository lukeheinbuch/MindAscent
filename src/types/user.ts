export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type GoalTag = 'Stress' | 'Confidence' | 'Motivation' | 'Energy' | 'Focus';
export type SportLevel = 'Recreational' | 'Amateur' | 'Collegiate' | 'Professional' | 'Other';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  age: number;
  sport: string;
  level: SportLevel;
  experience?: ExperienceLevel;
  goals: GoalTag[];
  about?: string;
  country?: string;
  
  createdAt: number;     // Date.now()
  lastLoginAt: number;   // Date.now()
  
  // App progress fields (placeholders for later)
  xp: number;
  levelNum: number;
  streak: number;
  badges: string[];
  preferences?: {
    theme?: 'dark';
    range?: '7d' | '30d' | '90d' | 'all';
  };
}

export const SPORTS_OPTIONS = [
  'Basketball',
  'Soccer',
  'Tennis',
  'Baseball',
  'Football',
  'Swimming',
  'Track & Field',
  'Golf',
  'Volleyball',
  'Hockey',
  'Wrestling',
  'Gymnastics',
  'CrossFit',
  'Martial Arts',
  'Cycling',
  'Running',
  'Other'
];

export const GOALS_OPTIONS: GoalTag[] = [
  'Stress',
  'Confidence',
  'Motivation',
  'Energy',
  'Focus'
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export const SPORT_LEVELS: SportLevel[] = [
  'Recreational',
  'Amateur',
  'Collegiate',
  'Professional',
  'Other'
];
