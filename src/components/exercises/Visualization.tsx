import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, CheckCircle, ArrowRight, ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onExit?: () => void;
  onComplete?: () => void;
}

const tone = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
};

const STEPS = [
  {
    id: 'arrival',
    title: 'Arrive in the Moment',
    prompt: 'Close your eyes. Take a slow breath. Let your shoulders drop. We are going to visualize a successful performance.',
    cue: 'Let distractions soften. Feel the ground supporting you.'
  },
  {
    id: 'scene',
    title: 'See the Arena',
    prompt: 'Picture the setting of your performance or game. Notice colors, lighting, and your position.',
    cue: 'Bring vivid detail to what you see around you.'
  },
  {
    id: 'embody',
    title: 'Feel Success in Your Body',
    prompt: 'Visualize yourself executing beautifully. Feel the sensations of flow—steady breath, coordinated movement, clear focus.',
    cue: 'Let confidence spread through your posture and expression.'
  },
  {
    id: 'present',
    title: 'Present, Not Outcome-Focused',
    prompt: 'Allow yourself to be fully present in the game—not worried about the outcome. Focus on what you’re doing right now.',
    cue: 'Attention rests on the next action and the sensation of being in flow.'
  },
  {
    id: 'lock',
    title: 'Lock It In',
    prompt: 'Anchor one word that captures this state (e.g., “Calm”, “Sharp”, “Flow”). Whisper it once and remember the feeling.',
    cue: 'This is your cue to return to during the real performance.'
  },
];

const stepAccent = (idx: number) => (
  idx === 0 ? 'from-rose-900/50 via-rose-700/30' :
  idx === 1 ? 'from-amber-900/50 via-amber-700/30' :
  idx === 2 ? 'from-emerald-900/50 via-emerald-700/30' :
  idx === 3 ? 'from-sky-900/50 via-sky-700/30' :
              'from-fuchsia-900/50 via-fuchsia-700/30'
);

const Visualization: React.FC<Props> = ({ onExit, onComplete }) => {
  const { user } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [index, setIndex] = useState(0);
  const [anchorWord, setAnchorWord] = useState('');
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const current = STEPS[index];
  const stepIndexProgress = completed ? 1 : (index + 1) / STEPS.length;
  const canNext = index < STEPS.length - 1;

  const play = () => { if (soundOn) tone(); };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const next = () => {
    stopTimer();
    setIsActive(false);
    setIsPaused(false);
    if (canNext) {
      setIndex(i => i + 1);
      play();
    } else {
      finish();
    }
  };

  const prev = () => { if (index > 0) { stopTimer(); setIsActive(false); setIsPaused(false); setIndex(i => i - 1); } };

  const reset = () => { stopTimer(); setIndex(0); setAnchorWord(''); setCompleted(false); setIsActive(false); setIsPaused(false); };
  
  // Reset timer on step change or when resetting
  useEffect(() => { if (!completed) setTimeLeft(60); }, [index, completed]);

  // Manage countdown only when started and not paused
  useEffect(() => {
    if (completed || !isActive || isPaused) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          setTimeout(() => next(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [isActive, isPaused, completed]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const start = () => { if (!isActive) { setIsActive(true); setIsPaused(false); } };
  const pause = () => { if (isActive && !isPaused) { setIsPaused(true); } };
  const resume = () => { if (isActive && isPaused) { setIsPaused(false); } };
  const circleProgress = 1 - timeLeft / 60;

  const finish = () => {
    setCompleted(true);
    play();
    if (user) {
      try {
        const key = `completedExercises_${user.uid}`;
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        completions.push({
          exerciseId: 'visualization',
          exerciseName: 'Visualization',
          completedAt: new Date().toISOString(),
          anchorWord: anchorWord || null,
          xpEarned: 10,
        });
        localStorage.setItem(key, JSON.stringify(completions));
      } catch {}
    }
    onComplete?.();
  };

  useEffect(() => {
    // allow keyboard nav
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Animated overlays tied to step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ mixBlendMode: 'screen' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stepAccent(index)} to-transparent`} />
        </motion.div>
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visualization</h1>
          <p className="text-gray-400 text-sm">Mentally rehearse success and the sensation of flow.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSoundOn(s => !s)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors">
            {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
          </button>
          {onExit && (
            <button onClick={onExit} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Exit">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-24 w-full px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
          <span>{completed ? 'Complete' : `Step ${index + 1} of ${STEPS.length}`}</span>
          <span>{Math.round(stepIndexProgress * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600" initial={false} animate={{ width: `${stepIndexProgress * 100}%` }} transition={{ duration: 0.25, ease: 'linear' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-48 pb-24 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45, ease: 'easeInOut' }} className="w-full text-center">
              <p className="mb-2 text-xs tracking-wide text-red-300 uppercase">Guided Step</p>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">{current.title}</h2>
              <p className="text-gray-300 mb-6 text-base leading-relaxed">{current.prompt}</p>
              <p className="text-gray-400 italic">{current.cue}</p>

              {current.id === 'lock' && (
                <div className="mt-6">
                  <label className="block text-sm text-gray-300 mb-2">Anchor Word</label>
                  <input
                    value={anchorWord}
                    onChange={e => setAnchorWord(e.target.value)}
                    placeholder="e.g., Flow"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                  />
                </div>
              )}

              {/* Circular countdown like Body Scan */}
              <div className="mt-8 flex items-center justify-center">
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
                      strokeDashoffset={(1 - circleProgress) * 2 * Math.PI * 45}
                      strokeLinecap="round"
                      initial={false}
                      animate={{ strokeDashoffset: (1 - circleProgress) * 2 * Math.PI * 45 }}
                      transition={{ duration: 0.25, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {!isActive && !completed && (
                      <p className="text-xs md:text-sm text-gray-400">Press Start</p>
                    )}
                    {completed && (
                      <div className="text-center">
                        <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-base md:text-lg font-semibold text-white">Session Complete</p>
                      </div>
                    )}
                    {!completed && (
                      <p className="mt-2 text-sm text-gray-300 font-mono">{formatTime(timeLeft)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button onClick={prev} disabled={index === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${index === 0 ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-white/10 text-gray-200 hover:bg-white/10'}`}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  {!isActive && !completed && (
                    <button onClick={start} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors">
                      <Play className="w-4 h-4" /> Start
                    </button>
                  )}
                  {isActive && !isPaused && !completed && (
                    <button onClick={pause} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}
                  {isActive && isPaused && !completed && (
                    <button onClick={resume} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors">
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  )}
                  <button onClick={next} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors">
                    {index === STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-6 bg-gray-800/70 backdrop-blur-sm rounded-xl p-10 border border-gray-700">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
              <h3 className="text-3xl font-bold text-white">Visualization Complete</h3>
              {anchorWord && <p className="text-gray-300">Your anchor word: <span className="font-semibold text-white">{anchorWord}</span></p>}
              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition">
                  <RotateCcw className="w-5 h-5" /> New Visualization
                </button>
                {onExit && (
                  <button onClick={onExit} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-4 rounded-xl font-semibold transition">
                    Exit
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Visualization;
