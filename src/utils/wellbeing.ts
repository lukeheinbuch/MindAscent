export function normalize10to100(x: number) {
  return Math.max(0, Math.min(100, ((x - 1) / 9) * 100));
}

type WellbeingInput = {
  // Legacy names
  mood?: number;
  stress?: number;           // if provided, higher = worse; will be inverted
  energy?: number;
  motivation?: number;
  confidence?: number;
  focus?: number;
  recovery?: number;
  sleep?: number;            // 1-10 sleep quality score
  // Supabase column names
  mood_rating?: number;
  stress_management?: number; // 1-10, higher = better
  energy_level?: number;
};

export function computeWellbeing(s: WellbeingInput) {
  // Overall wellbeing = average of 8 metrics: Mood, Stress Mgmt (or inverted Stress), Energy, Motivation,
  // Confidence, Focus, Recovery, Sleep Quality — scaled 0-100.
  const mood = normalize10to100(s.mood ?? s.mood_rating ?? 5);
  const stressMgmt = typeof s.stress === 'number'
    ? (100 - normalize10to100(s.stress))
    : normalize10to100(s.stress_management ?? 5);
  const energy = normalize10to100(s.energy ?? s.energy_level ?? 5);
  const motivationRaw = s.motivation ?? Math.round(((s.mood ?? s.mood_rating ?? 5) + (s.energy ?? s.energy_level ?? 5)) / 2);
  const motivation = normalize10to100(motivationRaw);
  const confidence = normalize10to100(s.confidence ?? 5);
  const focus = normalize10to100(s.focus ?? 5);
  const recovery = normalize10to100(s.recovery ?? 5);
  const sleep = normalize10to100(s.sleep ?? 5);

  return Math.round((mood + stressMgmt + energy + motivation + confidence + focus + recovery + sleep) / 8);
}
