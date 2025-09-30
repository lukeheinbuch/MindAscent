import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PMRProps {
  onExit?: () => void;
  onComplete?: () => void;
  tensionSeconds?: number; // default tension hold per group
  relaxSeconds?: number;   // default relaxation per group
}

interface MuscleGroup {
  id: string;
  name: string;
  cue: string;
}

const GROUPS: MuscleGroup[] = [
  { id: 'feet', name: 'Feet & Toes', cue: 'Curl toes tightly... then release fully.' },
  { id: 'calves', name: 'Calves', cue: 'Point toes forward to tense calves... then let go.' },
  { id: 'thighs', name: 'Thighs', cue: 'Squeeze quadriceps and hamstrings... release tension.' },
  { id: 'glutes', name: 'Glutes & Hips', cue: 'Contract glutes and hips... soften completely.' },
  { id: 'abdomen', name: 'Abdomen', cue: 'Draw belly in slightly... then relax and allow natural breath.' },
  { id: 'chest', name: 'Chest', cue: 'Inhale gently expanding chest... exhale and soften.' },
  { id: 'hands', name: 'Hands & Forearms', cue: 'Make a tight fist... release fingers and feel warmth.' },
  { id: 'arms', name: 'Upper Arms', cue: 'Flex biceps & triceps... let them lengthen.' },
  { id: 'shoulders', name: 'Shoulders', cue: 'Lift shoulders toward ears... drop and melt downward.' },
  { id: 'neck', name: 'Neck', cue: 'Press head gently back (no strain)... return to neutral.' },
  { id: 'face', name: 'Face & Jaw', cue: 'Scrunch facial muscles / clench jaw lightly... soften forehead, jaw, brow.' },
  { id: 'whole', name: 'Whole Body', cue: 'Lightly engage full body for a moment... exhale and release everything.' },
];

// Utility: split cue into tension (before ellipsis) and relax (after ellipsis)
const splitCue = (cue: string) => {
  const parts = cue.split('...');
  if (parts.length === 1) return { tension: cue, relax: '' };
  const tension = parts[0].trim() + '...';
  const relax = parts.slice(1).join('...').trim();
  return { tension, relax };
};

const tone = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {}
};

const ProgressiveMuscleRelaxation: React.FC<PMRProps> = ({ onExit, onComplete, tensionSeconds = 5, relaxSeconds = 5 }) => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'tension' | 'relax' | 'complete' | 'idle'>('idle');
  const [soundOn, setSoundOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedInPhase, setElapsedInPhase] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalPhases = GROUPS.length * 2; // tension + relax each
  const overallIndex = index * 2 + (phase === 'relax' ? 1 : 0);
  const progress = phase === 'complete' ? 1 : overallIndex / totalPhases;
  const percent = Math.round(progress * 100);
  const currentGroup = GROUPS[index];
  const phaseDuration = phase === 'tension' ? tensionSeconds : relaxSeconds;
  const phaseProgress = phase === 'complete' || phase === 'idle' ? 0 : Math.min(1, elapsedInPhase / phaseDuration);

  const playCue = () => { if (soundOn) tone(); };

  const start = () => {
    setPhase('tension');
    setElapsedInPhase(0);
    playCue();
  };

  const advance = () => {
    if (phase === 'tension') {
      setPhase('relax');
      setElapsedInPhase(0);
      playCue();
      return;
    }
    if (phase === 'relax') {
      if (index < GROUPS.length - 1) {
        setIndex(i => i + 1);
        setPhase('tension');
        setElapsedInPhase(0);
        playCue();
      } else {
        complete();
      }
    }
  };

  const complete = () => {
    setPhase('complete');
    playCue();
    if (user) {
      try {
        const key = `completedExercises_${user.uid}`;
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        completions.push({
          exerciseId: 'progressive-muscle-relaxation',
          exerciseName: 'Progressive Muscle Relaxation',
          completedAt: new Date().toISOString(),
          groups: GROUPS.length,
          xpEarned: 15,
        });
        localStorage.setItem(key, JSON.stringify(completions));
      } catch {}
    }
    onComplete?.();
  };

  // timer effect
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete' || isPaused) return;
    timerRef.current = setInterval(() => {
      setElapsedInPhase(prev => prev + 0.2);
    }, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, isPaused]);

  // phase auto advance
  useEffect(() => {
    if (phase === 'tension' || phase === 'relax') {
      const limit = phase === 'tension' ? tensionSeconds : relaxSeconds;
      if (elapsedInPhase >= limit) {
        advance();
      }
    }
  }, [elapsedInPhase, phase, tensionSeconds, relaxSeconds]);

  const reset = () => {
    setIndex(0);
    setPhase('idle');
    setElapsedInPhase(0);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Phase background overlay */}
      <AnimatePresence mode="wait">
        {phase === 'tension' && (
          <motion.div
            key="tension-bg"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-900/60 via-red-700/40 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        {phase === 'relax' && (
          <motion.div
            key="relax-bg"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-900/60 via-blue-800/40 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ mixBlendMode: 'screen' }}
          />
        )}
      </AnimatePresence>
      {/* Ambient visuals */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-500/40 to-transparent"
            style={{
              left: `${(Math.sin(i * 23.7) * 0.5 + 0.5) * 100}%`,
              top: `${(Math.cos(i * 31.1) * 0.5 + 0.5) * 100}%`,
              width: 3 + (i % 7),
              height: 3 + (i % 7)
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: (i % 12) * 0.3 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progressive Muscle Relaxation</h1>
          <p className="text-gray-400 text-sm">Systematically release stored tension.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
          </button>
          {onExit && (
            <button onClick={onExit} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Exit PMR">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-24 w-full px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
          <span>{phase === 'complete' ? 'Complete' : `Group ${index + 1} of ${GROUPS.length}`}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.25, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-48 pb-24 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {phase !== 'complete' && (
            <motion.div
              key={currentGroup.id + phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="w-full text-center"
            >
              {phase !== 'idle' && (
                <p className={`mb-6 tracking-wide font-extrabold uppercase ${phase === 'tension' ? 'text-red-300' : 'text-sky-300'} text-lg md:text-xl`}>
                  {phase === 'tension' ? 'Tense' : 'Relax'}
                </p>
              )}
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">{currentGroup.name}</h2>
              {phase === 'idle' && <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8">Tense then release each muscle group. Build proprioceptive awareness of tension vs release. Start when ready.</p>}
              {phase !== 'idle' && (
                <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8">
                  {(() => { const { tension, relax } = splitCue(currentGroup.cue); return phase === 'tension' ? tension : relax; })()}
                </p>
              )}

              {/* Circular phase progress */}
              {phase !== 'idle' && (
                <div className="relative mx-auto mb-12 flex items-center justify-center" style={{ width: 260, height: 260 }}>
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                    <motion.circle
                      cx="50" cy="50" r="46" fill="none" stroke={phase === 'relax' ? 'url(#pmrGradRelax)' : 'url(#pmrGradTension)'} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - phaseProgress) }}
                      transition={{ duration: 0.2, ease: 'linear' }}
                    />
                    <defs>
                      <linearGradient id="pmrGradTension" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="pmrGradRelax" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="relative text-center">
                    <div className="text-5xl font-bold text-white mb-2 tabular-nums">
                      {Math.max(0, Math.ceil(phaseDuration - elapsedInPhase))}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-400">Seconds</div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
                {phase === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={start}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition shadow-lg shadow-red-600/30"
                  >
                    <Play className="w-5 h-5" /> Begin
                  </motion.button>
                )}
                {phase !== 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPaused(p => !p)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-medium transition"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />} {isPaused ? 'Resume' : 'Pause'}
                  </motion.button>
                )}
                {phase !== 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={advance}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-5 rounded-xl font-bold text-lg tracking-wide transition shadow-lg shadow-red-600/40"
                  >
                    Next
                  </motion.button>
                )}
                {(phase !== 'idle') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={reset}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition"
                  >
                    <RotateCcw className="w-5 h-5" /> Reset
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6 bg-gray-800/70 backdrop-blur-sm rounded-xl p-10 border border-gray-700"
            >
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
              <h3 className="text-3xl font-bold text-white">Session Complete</h3>
              <p className="text-gray-300 max-w-md mx-auto">Notice the contrast between tension and ease. Carry this relaxed baseline forward.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressiveMuscleRelaxation;
