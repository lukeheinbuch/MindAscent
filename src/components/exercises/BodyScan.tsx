import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, CheckCircle, List, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BodyScanProps {
  onComplete?: () => void;
  onExit?: () => void;
  autoAdvanceInterval?: number; // ms per step
  includeIntro?: boolean;
}

interface ScanStep {
  id: string;
  label: string;
  instruction: string;
  duration: number; // ms
}

const buildSteps = (includeIntro: boolean, interval: number): ScanStep[] => {
  const base: ScanStep[] = [
    { id: 'head', label: 'Head & Scalp', instruction: 'Gently rest awareness at the crown of your head. Notice temperature, tingling, or stillness without changing anything.', duration: interval },
    { id: 'face', label: 'Face & Jaw', instruction: 'Relax the forehead, soften around the eyes, unclench the jaw, and allow the tongue to rest.', duration: interval },
    { id: 'neck', label: 'Neck & Throat', instruction: 'Sense the length of the neck. Release any subtle tightening or bracing.', duration: interval },
    { id: 'shoulders', label: 'Shoulders & Arms', instruction: 'Feel the shoulders melt downward. Move attention slowly down each arm to the hands and fingers.', duration: interval },
    { id: 'chest', label: 'Chest & Breath', instruction: 'Notice the natural rise and fall of the chest. Let the breath remain unforced and effortless.', duration: interval },
    { id: 'abdomen', label: 'Abdomen', instruction: 'Allow the belly to be soft. Sense expansion on inhale and release on exhale.', duration: interval },
    { id: 'back', label: 'Lower Back & Hips', instruction: 'Bring awareness to the lower back and hips. Invite space and ease into any tight areas.', duration: interval },
    { id: 'legs', label: 'Legs', instruction: 'Scan through thighs, knees, calves, ankles. Notice contact with the surface beneath you.', duration: interval },
    { id: 'feet', label: 'Feet & Toes', instruction: 'Rest attention in the feet and toes. Feel weight, temperature, or subtle pulsations.', duration: interval },
    { id: 'whole', label: 'Whole Body', instruction: 'Hold your body in awareness as one field. Breathe gently and rest in this full-body presence.', duration: interval },
  ];
  if (includeIntro) {
    return [
      { id: 'intro', label: 'Arrival', instruction: 'Close your eyes. Take 3 slow breaths. Let go of the day and settle into stillness.', duration: interval },
      ...base,
    ];
  }
  return base;
};

const BodyScan: React.FC<BodyScanProps> = ({ onComplete, onExit, autoAdvanceInterval = 45000, includeIntro = true }) => {
  const { user } = useAuth();
  const steps = buildSteps(includeIntro, autoAdvanceInterval);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(steps[0].duration);
  const [showSteps, setShowSteps] = useState(false);
  const [soundOn, setSoundOn] = useState(true); // toggleable sound
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartRef = useRef<number>(0);

  // Single pleasant tone function reused from Box Breathing simplified
  const playStepChime = () => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.0004, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.9);
      osc.connect(gain).connect(filter).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch {}
  };

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
    stepStartRef.current = Date.now();
  };

  const pause = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resume = () => {
    setIsPaused(false);
    stepStartRef.current = Date.now() - (steps[currentIndex].duration - timeRemaining);
  };

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex(0);
    setIsActive(false);
    setIsPaused(false);
    setIsComplete(false);
    setTimeRemaining(steps[0].duration);
  };

  const advance = () => {
    if (currentIndex + 1 >= steps.length) {
      finish();
      return;
    }
    setCurrentIndex(i => i + 1);
    setTimeRemaining(steps[currentIndex + 1].duration);
    stepStartRef.current = Date.now();
    playStepChime();
  };

  const finish = () => {
    setIsComplete(true);
    setIsActive(false);
    playStepChime();
    if (user) {
      try {
        const completions = JSON.parse(localStorage.getItem(`completedExercises_${user.uid}`) || '[]');
        completions.push({
          exerciseId: 'body-scan',
          exerciseName: 'Guided Body Scan',
            completedAt: new Date().toISOString(),
          steps: steps.length,
          duration: steps.reduce((acc, s) => acc + s.duration, 0),
          xpEarned: 15,
        });
        localStorage.setItem(`completedExercises_${user.uid}`, JSON.stringify(completions));
      } catch (e) {
        // silent
      }
    }
    onComplete?.();
  };

  // Timer effect
  useEffect(() => {
    if (!isActive || isPaused || isComplete) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - stepStartRef.current;
      const remaining = Math.max(0, steps[currentIndex].duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        advance();
      }
    }, 250);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isPaused, isComplete, currentIndex, steps]);

  // Cleanup
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progress = 1 - timeRemaining / steps[currentIndex].duration;
  const current = steps[currentIndex];

  // Dynamic gradient colors per step index (loops through palette)
  const gradientPalette = [
    'from-red-600/40 via-red-500/10 to-rose-700/40',
    'from-amber-500/30 via-orange-500/10 to-red-600/30',
    'from-emerald-500/30 via-teal-500/10 to-green-700/30',
    'from-sky-500/30 via-cyan-500/10 to-blue-700/30',
    'from-violet-500/30 via-fuchsia-500/10 to-purple-700/30',
  ];
  const gradientClass = gradientPalette[currentIndex % gradientPalette.length];

  const overallProgress = ((currentIndex) / (steps.length)) * 100 + progress * (100 / steps.length);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Animated background layers */}
      <motion.div
        key={current.id + '-bg'}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientClass} blur-3xl`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full max-w-6xl mx-auto px-4 pt-6 pb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500 text-3xl md:text-4xl lg:text-5xl">Guided Body Scan</h1>
              <p className="text-gray-300 mt-1 text-sm md:text-base">Mindfulness awareness practice to build whole-body calm and presence.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end text-xs text-gray-400">
                <span>Step {currentIndex + 1} / {steps.length}</span>
                <span className="mt-1">{Math.round(overallProgress)}% Complete</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundOn(s => !s)}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 backdrop-blur px-3 py-1.5 text-xs font-medium text-gray-200 border border-white/10 hover:bg-white/10 transition"
                aria-label={soundOn ? 'Mute guidance sound' : 'Unmute guidance sound'}
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
              </button>
              <button
                type="button"
                onClick={() => setShowSteps(s => !s)}
                className="sm:hidden inline-flex items-center gap-1 rounded-full bg-white/5 backdrop-blur px-3 py-1.5 text-xs font-medium text-gray-200 border border-white/10 hover:bg-white/10 transition"
              >
                <List className="w-4 h-4" /> Steps {showSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {onExit && (
                <button onClick={onExit} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition" aria-label="Exit body scan">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          {/* Top progress bar */}
          <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
              style={{ width: `${overallProgress}%` }}
              initial={false}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </header>

        {/* Main grid */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 pb-10 grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Primary panel */}
          <div className="flex flex-col items-center">
            {/* Instruction + circle container */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 shadow-lg relative overflow-hidden"
                >
                  <motion.div
                    key={current.id + '-halo'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight text-red-300 drop-shadow">{current.label}</h2>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed md:leading-relaxed max-w-3xl">
                    {current.instruction}
                  </p>
                  {isActive && !isPaused && !isComplete && (
                    <div className="text-xs md:text-sm text-gray-400 mt-4" aria-live="polite">{Math.ceil(timeRemaining / 1000)}s remaining</div>
                  )}

                  {/* Circular progress */}
                  <div className="mt-10 flex items-center justify-center">
                    <div className="relative">
                      <svg className="w-52 h-52 md:w-64 md:h-64 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#1f2937" strokeWidth="8" fill="none" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#ef4444"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={(1 - progress) * 2 * Math.PI * 45}
                          strokeLinecap="round"
                          initial={false}
                          animate={{ strokeDashoffset: (1 - progress) * 2 * Math.PI * 45 }}
                          transition={{ duration: 0.25, ease: 'linear' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {!isActive && !isComplete && (
                          <p className="text-xs md:text-sm text-gray-400">{current.label}</p>
                        )}
                        {isComplete && (
                          <div className="text-center">
                            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-base md:text-lg font-semibold text-white">Session Complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-10 flex flex-wrap gap-3 justify-center">
                    {!isActive && !isComplete && (
                      <button className="btn-primary !px-6 !py-2.5 text-sm" onClick={start}>
                        <Play className="w-5 h-5" /> Start
                      </button>
                    )}
                    {isActive && !isPaused && !isComplete && (
                      <button className="btn-secondary !px-6 !py-2.5 text-sm" onClick={pause}>
                        <Pause className="w-5 h-5" /> Pause
                      </button>
                    )}
                    {isActive && isPaused && (
                      <button className="btn-primary !px-6 !py-2.5 text-sm" onClick={resume}>
                        <Play className="w-5 h-5" /> Resume
                      </button>
                    )}
                    {isActive && !isComplete && (
                      <button className="btn-secondary !px-6 !py-2.5 text-sm" onClick={advance}>
                        Skip
                      </button>
                    )}
                    {isComplete && (
                      <>
                        <button className="btn-primary !px-6 !py-2.5 text-sm" onClick={restart}>
                          <RotateCcw className="w-5 h-5" /> Restart
                        </button>
                        {onExit && (
                          <button className="btn-secondary !px-6 !py-2.5 text-sm" onClick={onExit}>Exit</button>
                        )}
                      </>
                    )}
                  </div>

                  {isComplete && (
                    <div className="mt-8 text-center text-gray-300 text-sm md:text-base max-w-xl mx-auto">
                      Pause for a moment and notice any shifts in your body or mind. Regular practice deepens awareness and recovery.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Steps sidebar / mobile panel */}
          <div className={`lg:block ${showSteps ? 'block' : 'hidden'} sm:hidden lg:!block`}>
            <div className="sticky top-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase mb-4 flex items-center gap-2">
                  <List className="w-4 h-4" /> Steps
                </h3>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {steps.map((s, idx) => {
                    const active = idx === currentIndex;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (timerRef.current) clearInterval(timerRef.current);
                            setCurrentIndex(idx);
                            setTimeRemaining(steps[idx].duration);
                            if (isActive) stepStartRef.current = Date.now();
                          }}
                          className={`w-full text-left group rounded-lg px-3 py-2 text-xs md:text-sm transition border ${active ? 'bg-red-600/30 border-red-500/40 text-red-100 shadow-inner' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{idx + 1}. {s.label}</span>
                            {idx < currentIndex && <span className="text-green-400 text-[10px]">Done</span>}
                            {active && !isComplete && <span className="text-[10px] text-red-300">Active</span>}
                          </div>
                          {active && (
                            <motion.div
                              layoutId="activeStepBar"
                              className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded mt-2"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 text-xs text-gray-400 leading-relaxed">
                Maintain a gentle, curious attention. If the mind wanders, return softly to the current region of the body without judgment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyScan;
