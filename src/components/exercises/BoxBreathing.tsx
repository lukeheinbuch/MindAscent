import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Trophy, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BoxBreathingProps {
  onComplete?: () => void;
  onExit?: () => void;
  totalCycles?: number;
  phaseDuration?: number;
}

type BreathingPhase = 'inhale' | 'hold_inhale' | 'exhale' | 'hold_exhale';

interface PhaseConfig {
  name: string;
  instruction: string;
  textColor: string;
  scale: number;
  duration: number;
}

const BoxBreathing: React.FC<BoxBreathingProps> = ({
  onComplete,
  onExit,
  totalCycles = 4,
  phaseDuration = 4000, // 4 seconds
}) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(phaseDuration);
  // Visuals always on; removed toggle
  const [soundOn, setSoundOn] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartTimeRef = useRef<number>(0);

  const phaseConfigs: Record<BreathingPhase, PhaseConfig> = {
    inhale: {
      name: 'Inhale',
      instruction: 'Breathe in slowly through your nose',
      textColor: 'text-red-400',
      scale: 1.6,
      duration: phaseDuration,
    },
    hold_inhale: {
      name: 'Hold',
      instruction: 'Hold your breath gently',
      textColor: 'text-gray-300',
      scale: 1.6,
      duration: phaseDuration,
    },
    exhale: {
      name: 'Exhale',
      instruction: 'Breathe out slowly through your mouth',
      textColor: 'text-red-500',
      scale: 0.4,
      duration: phaseDuration,
    },
    hold_exhale: {
      name: 'Hold',
      instruction: 'Rest with empty lungs',
      textColor: 'text-gray-300',
      scale: 0.4,
      duration: phaseDuration,
    },
  };

  const currentPhaseConfig = phaseConfigs[currentPhase];

  // Get next phase in the sequence
  const getNextPhase = (phase: BreathingPhase): BreathingPhase => {
    const phaseOrder: BreathingPhase[] = ['inhale', 'hold_inhale', 'exhale', 'hold_exhale'];
    const currentIndex = phaseOrder.indexOf(phase);
    return phaseOrder[(currentIndex + 1) % phaseOrder.length];
  };

  // Start breathing session
  const startBreathing = () => {
    setIsActive(true);
    setIsPaused(false);
    phaseStartTimeRef.current = Date.now();
  };

  // Pause breathing session
  const pauseBreathing = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Resume breathing session
  const resumeBreathing = () => {
    setIsPaused(false);
    phaseStartTimeRef.current = Date.now() - (currentPhaseConfig.duration - timeRemaining);
  };

  // Restart breathing session
  const restartBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentPhase('inhale');
    setCurrentCycle(1);
    setTimeRemaining(phaseDuration);
  setRipples([]);
  };

  // Complete session and log to Firestore
  const completeSession = async () => {
    setIsComplete(true);
    setIsActive(false);

    if (user) {
      try {
        // Log completion to localStorage in demo mode
        const completionData = {
          exerciseId: 'box-breathing',
          exerciseName: 'Box Breathing',
          completedAt: new Date().toISOString(),
          duration: totalCycles * 4 * phaseDuration, // Total session time
          cycles: totalCycles,
          xpEarned: 15,
        };

        const completions = JSON.parse(localStorage.getItem(`completedExercises_${user.uid}`) || '[]');
        completions.push(completionData);
        localStorage.setItem(`completedExercises_${user.uid}`, JSON.stringify(completions));

        console.log('Box breathing session completed and logged');
      } catch (error) {
        console.error('Error logging exercise completion:', error);
      }
    }

    if (onComplete) {
      onComplete();
    }
  };

  // Simple Web Audio bell/chime per phase end
  const playPhaseChime = () => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Single pleasant tone (C5 ~523Hz slightly detuned)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      // Gentle envelope
      gain.gain.setValueAtTime(0.0004, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.9);

      osc.connect(gain).connect(filter).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch {}
  };

  // Main timer effect
  useEffect(() => {
    if (!isActive || isPaused || isComplete) {
      return;
    }

  intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - phaseStartTimeRef.current;
      const remaining = Math.max(0, currentPhaseConfig.duration - elapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        const endedPhase = currentPhase; // phase just finished
  playPhaseChime(); // chime every phase end (single tone)

        // Determine next phase
        const nextPhase = getNextPhase(currentPhase);

        // If we just finished the last phase of the box (hold_exhale), advance cycle or complete
        if (endedPhase === 'hold_exhale') {
          const nextCycle = currentCycle + 1;
          if (nextCycle > totalCycles) {
            completeSession();
            return;
          } else {
            setCurrentCycle(nextCycle);
          }
        }

        setCurrentPhase(nextPhase);
        setTimeRemaining(phaseConfigs[nextPhase].duration);
        phaseStartTimeRef.current = now;
      }
  }, 30); // Faster interval for smoother progress bar

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, isComplete, currentPhase, currentCycle, totalCycles, currentPhaseConfig.duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const progress = ((currentPhaseConfig.duration - timeRemaining) / currentPhaseConfig.duration) * 100;

  // Mantras per phase
  const mantras: Record<BreathingPhase, string> = {
    inhale: 'Calm energy in',
    hold_inhale: 'Stillness',
    exhale: 'Release and soften',
    hold_exhale: 'Empty – quiet mind',
  };

  // Ripple effects when reaching a hold after growth or contraction
  const [ripples, setRipples] = useState<{ id: number; phase: BreathingPhase }[]>([]);
  useEffect(() => {
    if (!isActive) return;
    if (currentPhase === 'hold_inhale' || currentPhase === 'hold_exhale') {
      setRipples(rs => [...rs.slice(-4), { id: Date.now(), phase: currentPhase }]);
    }
  }, [currentPhase, isActive]);

  // Particle field (simple deterministic positions)
  const particles = Array.from({ length: 40 }, (_, i) => {
    const seed = i * 42.42;
    const x = (Math.sin(seed) * 0.5 + 0.5) * 100; // percent
    const y = (Math.cos(seed) * 0.5 + 0.5) * 100;
    const size = 2 + (Math.sin(seed * 3.1) + 1) * 2;
    const delay = (i % 10) * 0.4;
    return { x, y, size, delay };
  });

  // Phase mapping for square highlight (top -> inhale, right -> hold_inhale, bottom -> exhale, left -> hold_exhale)
  const squareSides: Record<BreathingPhase, number> = {
    inhale: 0,
    hold_inhale: 1,
    exhale: 2,
    hold_exhale: 3,
  };
  const activeSide = squareSides[currentPhase];

  // Get circle color based on phase
  const getCircleColor = (phase: BreathingPhase) => {
    switch (phase) {
      case 'inhale':
        return 'bg-red-600'; // Vibrant red for inhaling
      case 'hold_inhale':
        return 'bg-neutral-700'; // Softer grey for holding
      case 'exhale':
        return 'bg-red-800'; // Darker red for exhaling
      case 'hold_exhale':
        return 'bg-neutral-700'; // Softer grey for holding
      default:
        return 'bg-red-600';
    }
  };

  // Get glow color based on phase
  const getGlowColor = (phase: BreathingPhase) => {
    switch (phase) {
      case 'inhale':
        return 'bg-red-600/30'; // Vibrant red glow
      case 'hold_inhale':
        return 'bg-neutral-500/20'; // Neutral glow
      case 'exhale':
        return 'bg-red-800/25'; // Darker red glow
      case 'hold_exhale':
        return 'bg-neutral-500/20'; // Neutral glow
      default:
        return 'bg-red-600/30';
    }
  };

  // Progress ring logic: build a normalized 0-1 progress for outline
  let ringProgress = 0;
  if (currentPhase === 'inhale') {
    ringProgress = progress / 100; // fill up
  } else if (currentPhase === 'hold_inhale') {
    ringProgress = 1; // full
  } else if (currentPhase === 'exhale') {
    ringProgress = 1 - (progress / 100); // emptying
  } else if (currentPhase === 'hold_exhale') {
    ringProgress = 0; // empty
  }

  // Monotonic session progress (0-1) across all phases/cycles so top bar never reverses
  const linearPhaseOrder: BreathingPhase[] = ['inhale','hold_inhale','exhale','hold_exhale'];
  const phaseIndex = linearPhaseOrder.indexOf(currentPhase);
  const elapsedInPhase = currentPhaseConfig.duration - timeRemaining; // ms elapsed in current phase
  const phaseFraction = Math.min(1, elapsedInPhase / currentPhaseConfig.duration);
  const sessionProgress = ((currentCycle - 1) * 4 + phaseIndex + phaseFraction) / (totalCycles * 4);
  const overallPercent = Math.round(sessionProgress * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient particles */}
  {(
        <div className="pointer-events-none absolute inset-0">
          {particles.map((p, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-gradient-to-br from-red-500/40 to-pink-500/10"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
              transition={{ duration: 6 + (idx % 5), repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
      {/* Radial vignette */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_70%)]" />
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Box Breathing</h1>
          <p className="text-gray-400">4-4-4-4 Rhythm</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Removed visuals toggle */}
          <button
            onClick={() => setSoundOn(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
            aria-label={soundOn ? 'Disable sound cues' : 'Enable sound cues'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
          </button>
        {onExit && (
          <button
            onClick={onExit}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        </div>
      </div>

      {/* Cycle Counter & Monotonic Progress */}
  <div className="absolute top-24 w-full px-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">Cycle {currentCycle} / {totalCycles}</p>
          <p className="text-gray-500 text-xs">{overallPercent}% overall</p>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
            initial={false}
    animate={{ width: `${overallPercent}%` }}
    transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Main Content */}
  <div className="flex flex-col items-center flex-1 pt-32">
        {/* Phase Label and Instruction - Positioned above circle */}
  <div className="mb-12 text-center space-y-2 z-10 w-full px-4 min-h-[150px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h2 className={`text-5xl font-bold ${currentPhaseConfig.textColor} mb-2`}>
                {currentPhaseConfig.name}
              </h2>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                {currentPhaseConfig.instruction}
              </p>
              <div className="text-sm text-gray-500 mt-2">
                {Math.ceil(timeRemaining / 1000)}s remaining
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

    {/* Breathing Circle */}
  <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <motion.div
            className={`absolute rounded-full blur-2xl ${getGlowColor(currentPhase)}`}
            animate={{
              scale: (isActive ? currentPhaseConfig.scale : 1.0) * 1.15,
      opacity: isActive && !isPaused ? 0.85 : 0.35,
            }}
            transition={{
      duration: currentPhase.includes('hold') ? 0.35 : 4,
      ease: 'linear',
            }}
            style={{ width: '200px', height: '200px' }}
          />
          
          {/* Wrapper to keep ring synced with scaling */}
          <div className="relative" style={{ width: 260, height: 260 }}>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              <motion.circle
                cx="50" cy="50" r="48" fill="none" stroke="url(#bbGrad)" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 48}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - ringProgress) }}
                transition={{ duration: 0.2, ease: 'linear' }}
              />
              <defs>
                <linearGradient id="bbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </svg>
            {/* Main breathing circle (constant linear growth/shrink) */}
      <motion.div
              className={`absolute inset-0 m-auto rounded-full border-2 border-red-400/30 shadow-2xl ${getCircleColor(currentPhase)}`}
              animate={{
        scale: isActive ? currentPhaseConfig.scale : 1.0,
                backgroundColor: currentPhase === 'inhale' ? '#dc2626' : 
                               currentPhase === 'hold_inhale' ? '#404040' :
                               currentPhase === 'exhale' ? '#991b1b' : '#404040',
              }}
              transition={{
                duration: currentPhase.includes('hold') ? 0.3 : 4,
                ease: 'linear',
              }}
              style={{ width: '200px', height: '200px' }}
            />
            {/* Ripple layers */}
            {ripples.map(r => (
              <motion.div
                key={r.id}
                className="absolute inset-0 m-auto rounded-full border border-red-400/30"
                initial={{ scale: r.phase === 'hold_inhale' ? 1 : 0.4, opacity: 0.4 }}
                animate={{ scale: r.phase === 'hold_inhale' ? 1.35 : 0.9, opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
              />
            ))}
            {/* Phase gradient overlay for creative feel */}
            <motion.div
              key={currentPhase + '-overlay'}
              className="absolute inset-0 rounded-full mix-blend-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                background: currentPhase === 'inhale'
                  ? 'radial-gradient(circle at 50% 50%, rgba(248,113,113,0.4), transparent 70%)'
                  : currentPhase === 'exhale'
                    ? 'radial-gradient(circle at 50% 50%, rgba(153,27,27,0.45), transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(120,113,108,0.35), transparent 70%)'
              }}
            />
          </div>
        </div>

        {/* Mantra text */}
        {!isComplete && (
          <div className="mt-10 h-6 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase + '-mantra'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.8, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-sm tracking-wide text-red-200/80 font-medium drop-shadow"
              >
                {mantras[currentPhase]}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Completion Message - Positioned below circle */}
        <div className="mt-16">
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center space-y-4 bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
              >
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Session Complete!</h3>
                <p className="text-gray-400">
                  You completed {totalCycles} cycles of box breathing
                </p>
                <p className="text-green-400 font-semibold">+15 XP Earned</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
  <div className="absolute bottom-8 flex items-center space-x-4">
        {!isActive && !isComplete && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
            whileTap={{ scale: 0.95 }}
            onClick={startBreathing}
            className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-600/25"
          >
            <Play className="w-5 h-5" />
            <span>Start Breathing</span>
          </motion.button>
        )}

        {isActive && !isPaused && !isComplete && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#4b5563' }}
            whileTap={{ scale: 0.95 }}
            onClick={pauseBreathing}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </motion.button>
        )}

        {isPaused && !isComplete && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
            whileTap={{ scale: 0.95 }}
            onClick={resumeBreathing}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-red-600/25"
          >
            <Play className="w-5 h-5" />
            <span>Resume</span>
          </motion.button>
        )}

        {(isActive || isPaused || isComplete) && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
            whileTap={{ scale: 0.95 }}
            onClick={restartBreathing}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restart</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default BoxBreathing;
