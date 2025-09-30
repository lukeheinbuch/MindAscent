import React, { useEffect, useRef, useState } from 'react';
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
    osc.frequency.setValueAtTime(493.88, ctx.currentTime); // B4
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
};

const STEPS = [
  { id: 'settle', title: 'Settle and Soften', prompt: 'Sit quietly. Let your shoulders drop and your breath find a natural rhythm.', cue: 'Allow the body to be still and supported.' },
  { id: 'open', title: 'Open Awareness', prompt: 'Let attention roam freely across sounds, sensations, and sights.', cue: 'Nothing to control—just notice.' },
  { id: 'observe', title: 'Observe Without Judgment', prompt: 'Notice experiences arise and pass—label them lightly if helpful.', cue: 'Curiosity over evaluation.' },
  { id: 'curious', title: 'Stay Curious', prompt: 'If attention narrows, gently widen again to include more of your field.', cue: 'Soft, inclusive awareness.' },
  { id: 'reflect', title: 'What Did You Notice?', prompt: 'Take a moment to note something surprising or gentle you noticed.', cue: 'A small reflection integrates the practice.' },
];

const stepAccent = (idx: number) => (
  idx === 0 ? 'from-sky-900/50 via-sky-700/30' :
  idx === 1 ? 'from-emerald-900/50 via-emerald-700/30' :
  idx === 2 ? 'from-amber-900/50 via-amber-700/30' :
  idx === 3 ? 'from-fuchsia-900/50 via-fuchsia-700/30' :
              'from-rose-900/50 via-rose-700/30'
);

const OpenAwareness: React.FC<Props> = ({ onExit, onComplete }) => {
  const { user } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const current = STEPS[index];
  const stepIndexProgress = completed ? 1 : (index + 1) / STEPS.length;
  const circleProgress = 1 - timeLeft / 60;

  const play = () => { if (soundOn) tone(); };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const next = () => {
    stopTimer(); setIsActive(false); setIsPaused(false);
    if (index < STEPS.length - 1) { setIndex(i => i + 1); play(); } else { finish(); }
  };
  const prev = () => { if (index > 0) { stopTimer(); setIsActive(false); setIsPaused(false); setIndex(i => i - 1); } };
  const reset = () => { stopTimer(); setIndex(0); setNote(''); setCompleted(false); setIsActive(false); setIsPaused(false); setTimeLeft(60); };

  useEffect(() => { if (!completed) setTimeLeft(60); }, [index, completed]);
  useEffect(() => {
    if (completed || !isActive || isPaused) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { stopTimer(); setTimeout(() => next(), 0); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [isActive, isPaused, completed]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const start = () => { if (!isActive) { setIsActive(true); setIsPaused(false); } };
  const pause = () => { if (isActive && !isPaused) setIsPaused(true); };
  const resume = () => { if (isActive && isPaused) setIsPaused(false); };

  const finish = () => {
    setCompleted(true); play();
    if (user) {
      try {
        const key = `completedExercises_${user.uid}`;
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        completions.push({
          exerciseId: 'open-awareness',
          exerciseName: 'Open Awareness Meditation',
          completedAt: new Date().toISOString(),
          note: note || null,
          xpEarned: 10,
        });
        localStorage.setItem(key, JSON.stringify(completions));
      } catch {}
    }
    onComplete?.();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
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
          <h1 className="text-2xl font-bold">Open Awareness Meditation</h1>
          <p className="text-gray-400 text-sm">Let attention roam freely—curious, inclusive, and kind.</p>
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

              {current.id === 'reflect' && (
                <div className="mt-6">
                  <label className="block text-sm text-gray-300 mb-2">What did you notice?</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="A gentle sound, a subtle sensation, a shift in mood..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                  />
                </div>
              )}

              {/* Circular countdown */}
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
              <h3 className="text-3xl font-bold text-white">Open Awareness Complete</h3>
              {note && <p className="text-gray-300">You noticed: <span className="font-semibold text-white">{note}</span></p>}
              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition">
                  <RotateCcw className="w-5 h-5" /> New Session
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

export default OpenAwareness;
