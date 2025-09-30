export interface CheckIn {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD in user tz
  timestamp: number;      // ms
  mood: number;
  // Stress management (1-10, higher = better)
  stress_management: number;
  energy: number;
  motivation: number;
  confidence?: number;
  sleep: number;
  soreness?: number;
  focus: number;
  recovery?: number;
  trainingLoad: 'none' | 'light' | 'moderate' | 'hard';
  preCompetition: boolean;
  note?: string;
}

export interface DailyIndex {
  checkedIn: boolean;
  checkInRef?: string;
  date: string;
}

export interface CheckInFormData {
  mood: number;
  stress_management: number;
  energy: number;
  motivation: number;
  confidence?: number;
  sleep: number;
  soreness?: number;
  focus: number;
  recovery?: number;
  trainingLoad: 'none' | 'light' | 'moderate' | 'hard';
  preCompetition: boolean;
  note: string;
}

export interface CheckInStats {
  averages: {
    mood: number;
    stress_management: number;
    energy: number;
    motivation: number;
    sleep: number;
    soreness: number;
    focus: number;
  };
  deltas: {
    mood: number;
    stress_management: number;
    energy: number;
    motivation: number;
    sleep: number;
    soreness: number;
    focus: number;
  };
  variability: {
    mood: number;
    stress_management: number;
    energy: number;
    motivation: number;
    sleep: number;
    soreness: number;
    focus: number;
  };
  correlations: {
    sleepStressManagement: number;
  };
  trainingImpact: {
    none: { energy: number; motivation: number };
    light: { energy: number; motivation: number };
    moderate: { energy: number; motivation: number };
    hard: { energy: number; motivation: number };
  };
  sorenessRecovery: {
    day0: number;
    day1: number;
    day2: number;
    day3: number;
  };
  preCompetitionEffect: {
    focus: { preComp: number; normal: number };
    stress_management: { preComp: number; normal: number };
  };
  trends: {
    stress_management: number;  // 7-day slope
    motivation: number;  // 7-day slope
  };
  consistencyScore: number;  // 1-100
}
