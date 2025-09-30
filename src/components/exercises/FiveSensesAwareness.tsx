import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, CheckCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
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
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {}
};

const STEPS = [
  { id: 'see', label: 'See', count: 5, prompt: 'Notice five things you can see.' },
  { id: 'touch', label: 'Touch', count: 4, prompt: 'Notice four things you can touch.' },
  { id: 'hear', label: 'Hear', count: 3, prompt: 'Notice three things you can hear.' },
  { id: 'smell', label: 'Smell', count: 2, prompt: 'Notice two things you can smell.' },
  { id: 'taste', label: 'Taste', count: 1, prompt: 'Notice one thing you can taste.' },
];

const FiveSensesAwareness: React.FC<Props> = ({ onExit, onComplete }) => {
  const { user } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [index, setIndex] = useState(0);
  const [entries, setEntries] = useState<Record<string, string[]>>({ see: ['', '', '', '', ''], touch: ['', '', '', ''], hear: ['', '', ''], smell: ['', ''], taste: [''] });
  const [completed, setCompleted] = useState(false);

  const current = STEPS[index];
  const progress = completed ? 1 : (index + 1) / STEPS.length;

  const play = () => { if (soundOn) tone(); };

  const setItem = (stepId: string, idx: number, val: string) => {
    setEntries(prev => ({ ...prev, [stepId]: prev[stepId].map((v, i) => (i === idx ? val : v)) }));
  };

  const next = () => {
    if (index < STEPS.length - 1) {
      setIndex(i => i + 1);
      play();
    } else {
      finish();
    }
  };

  const prev = () => {
    if (index > 0) setIndex(i => i - 1);
  };

  const reset = () => {
    setIndex(0);
    setEntries({ see: ['', '', '', '', ''], touch: ['', '', '', ''], hear: ['', '', ''], smell: ['', ''], taste: [''] });
    setCompleted(false);
  };

  const finish = () => {
    setCompleted(true);
    play();
    if (user) {
      try {
        const key = `completedExercises_${user.uid}`;
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        completions.push({
          exerciseId: 'five-senses-awareness',
          exerciseName: 'Five Senses Awareness',
          completedAt: new Date().toISOString(),
          entries,
          xpEarned: 8,
        });
        localStorage.setItem(key, JSON.stringify(completions));
      } catch {}
    }
    onComplete?.();
  };

  useEffect(() => {
    // autofocus first input per step
    const el = document.querySelector<HTMLInputElement>('input[data-autofocus="true"]');
    if (el) el.focus();
  }, [index]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Animated overlays tied to step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className={`pointer-events-none absolute inset-0 transition-colors`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ mixBlendMode: 'screen' }}
        >
          <div className={`absolute inset-0 ${index === 0 ? 'bg-gradient-to-br from-amber-900/50 via-amber-700/30 to-transparent' : index === 1 ? 'bg-gradient-to-br from-emerald-900/50 via-emerald-700/30 to-transparent' : index === 2 ? 'bg-gradient-to-br from-sky-900/50 via-sky-700/30 to-transparent' : index === 3 ? 'bg-gradient-to-br from-fuchsia-900/50 via-fuchsia-700/30 to-transparent' : 'bg-gradient-to-br from-rose-900/50 via-rose-700/30 to-transparent'}`} />
        </motion.div>
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Five Senses Awareness</h1>
          <p className="text-gray-400 text-sm">Ground into the present using your senses.</p>
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
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.25, ease: 'linear' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-48 pb-24 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45, ease: 'easeInOut' }} className="w-full">
              <p className="mb-2 text-xs tracking-wide text-red-300 uppercase">{current.label}</p>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">{current.prompt}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: current.count }).map((_, i) => (
                  <input
                    key={i}
                    data-autofocus={i === 0}
                    value={entries[current.id][i] || ''}
                    onChange={e => setItem(current.id, i, e.target.value)}
                    placeholder={`${current.label} ${i + 1}`}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-6">
                <button onClick={prev} disabled={index === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${index === 0 ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-white/10 text-gray-200 hover:bg-white/10'}`}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={next} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors">
                  {index === STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-6 bg-gray-800/70 backdrop-blur-sm rounded-xl p-10 border border-gray-700">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
              <h3 className="text-3xl font-bold text-white">Awareness Complete</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left text-sm max-w-2xl mx-auto mt-4">
                {STEPS.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-red-300 font-semibold text-xs uppercase tracking-wide mb-1">{s.label}</p>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc pl-4">
                      {entries[s.id].filter(v => v.trim()).map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition">
                  <RotateCcw className="w-5 h-5" /> New Entry
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

export default FiveSensesAwareness;
