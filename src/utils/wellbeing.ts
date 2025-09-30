export function normalize10to100(x: number) {
  return Math.max(0, Math.min(100, ((x - 1) / 9) * 100));
}

type WellbeingInput = {
  // Legacy names
  mood?: number;
  stress?: number;
  energy?: number;
  motivation?: number;
  confidence?: number;
  // Supabase column names
  mood_rating?: number;
  stress_management?: number;
  energy_level?: number;
};

export function computeWellbeing(s: WellbeingInput) {
  // Overall wellbeing = average of core metrics (Mood, Stress Management, Energy, Motivation, Confidence), scaled 0-100
  const mood = normalize10to100(s.mood ?? s.mood_rating ?? 5);
  // If raw stress is provided (higher = worse), invert. Prefer stress_management (higher = better) when present.
  const stressMgmt = typeof s.stress === 'number'
    ? (100 - normalize10to100(s.stress))
    : normalize10to100(s.stress_management ?? 5);
  const energy = normalize10to100(s.energy ?? s.energy_level ?? 5);
  const motivationRaw = s.motivation ?? Math.round(((s.mood ?? s.mood_rating ?? 5) + (s.energy ?? s.energy_level ?? 5)) / 2);
  const motivation = normalize10to100(motivationRaw);
  const confidence = normalize10to100(s.confidence ?? 5);

  return Math.round((mood + stressMgmt + energy + motivation + confidence) / 5);
}
