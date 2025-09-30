// User Authentication
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Firestore User Profile (stored per user)
export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  lastCheckInDate?: string;
  badges: string[]; // Array of badge IDs
  createdAt: Date;
  updatedAt: Date;
}

// Firestore Check-in Document
export interface CheckInDocument {
  date: string; // YYYY-MM-DD format
  mood: number; // 1-10 scale
  stress_management: number; // 1-10 scale (10 = excellent stress management)
  energy: number; // 1-10 scale
  motivation: number; // 1-10 scale
  notes?: string;
  createdAt: Date;
}

// Firestore Completed Exercise Document
export interface CompletedExerciseDocument {
  exerciseId: string;
  completedAt: Date;
  xpAwarded?: number;
}

// Firestore Completed Education Document
export interface CompletedEducationDocument {
  articleId: string;
  completedAt: Date;
  xpAwarded?: number;
}

// Daily Check-in Data
export interface CheckInData {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  mood: number; // 1-10 scale
  stress_management: number; // 1-10 scale (10 = excellent stress management)
  energy: number; // 1-10 scale
  motivation: number; // 1-10 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mental Health Exercise
export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
  tags: string[];
  imageUrl?: string;
}

export type ExerciseCategory = 
  | 'breathing' 
  | 'mindfulness' 
  | 'visualization' 
  | 'confidence'
  | 'stress-relief'
  | 'focus'
  | 'recovery';

// Streak Tracking
export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string;
  totalCheckIns: number;
}

// Badges System
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'checkIn' | 'exercise';
  unlockedAt?: Date;
}

export interface UserBadge {
  badgeId: string;
  userId: string;
  unlockedAt: Date;
}

// Education Content
export interface EducationCard {
  id: string;
  title: string;
  description: string;
  category: EducationCategory;
  readTime: number; // in minutes
  content: string;
  url?: string; // optional external URL; if present, clicking opens this link
  imageUrl?: string;
  tags: string[];
  isBookmarked?: boolean;
}

export type EducationCategory = 
  | 'burnout'
  | 'confidence' 
  | 'recovery'
  | 'injury'
  | 'anxiety'
  | 'myths';

// Resources
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'hotline' | 'website' | 'clinic' | 'app' | 'professional';
  contact?: string; // phone number or URL
  location?: string;
  availability?: string; // "24/7", "Mon-Fri 9-5", etc.
  isEmergency?: boolean;
  // Optional metadata for richer display/filtering
  category?: EducationCategory; // reuse existing education categories
  length?: string; // e.g., "~7 min"
  tags: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Component Props
export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  emoji?: string[];
}

export interface CheckInFormData {
  mood: number;
  stress_management: number;
  energy: number;
  motivation: number;
  notes?: string;
}
