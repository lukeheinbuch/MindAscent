import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, Sparkles, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MantraMeditationProps {
  onExit?: () => void;
  onComplete?: () => void;
  totalRepetitions?: number; // total mantra repeats target
  sessionMinutes?: number; // optional timed mode
}

interface MantraRecord {
  id: string;
  text: string;
  count: number;
}

const DEFAULT_MANTRAS = [
  'I am focused',
  'I am strong',
  'I am calm under pressure',
  'I trust my preparation',
  'I play with clarity',
];

const tone = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.0004, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.8);
    osc.connect(gain).connect(filter).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch {}
};

const BACKGROUNDS = [
  // Rich, distinct gradients for immersive shifts
  'from-black via-zinc-900 to-black', // base
  'from-indigo-900 via-purple-900 to-slate-900',
  'from-rose-900 via-red-800 to-amber-800',
  'from-emerald-900 via-teal-800 to-sky-900',
  'from-fuchsia-900 via-purple-800 to-indigo-900',
  'from-amber-900 via-orange-800 to-rose-900',
  'from-cyan-900 via-blue-900 to-indigo-900',
  'from-lime-900 via-emerald-800 to-teal-900',
];

const MantraMeditation: React.FC<MantraMeditationProps> = ({ onExit, onComplete, totalRepetitions = 40, sessionMinutes }) => {
  const { user } = useAuth();
  const [mantraInput, setMantraInput] = useState('');
  const [mantras, setMantras] = useState<MantraRecord[]>(() => DEFAULT_MANTRAS.map((m, i) => ({ id: 'd'+i, text: m, count: 0 })));
  const [activeMantraId, setActiveMantraId] = useState<string>(mantras[0]?.id || '');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [totalSaid, setTotalSaid] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMantra = mantras.find(m => m.id === activeMantraId);
  const timeTargetMs = sessionMinutes ? sessionMinutes * 60 * 1000 : null;
  const sessionProgress = totalRepetitions ? Math.min(1, totalSaid / totalRepetitions) : (timeTargetMs ? Math.min(1, elapsedMs / timeTargetMs) : 0);
  const percent = Math.round(sessionProgress * 100);

  // Timer for timed mode
  useEffect(() => {
    if (!isActive || isPaused || !timeTargetMs || isComplete) return;
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - (startTime || Date.now()));
    }, 250);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isPaused, timeTargetMs, startTime, isComplete]);

  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    if (!startTime) setStartTime(Date.now());
  };
  const pauseSession = () => { setIsPaused(true); };
  const resumeSession = () => { setIsPaused(false); };
  const resetSession = () => {
    setIsActive(false); setIsPaused(false); setIsComplete(false);
    setMantras(ms => ms.map(m => ({ ...m, count: 0 })));
    setTotalSaid(0); setElapsedMs(0); setStartTime(null);
  };

  const addMantra = () => {
    const text = mantraInput.trim();
    if (!text) return;
    setMantras(ms => [...ms, { id: Date.now().toString(), text, count: 0 }]);
    setMantraInput('');
    setActiveMantraId(prev => prev || Date.now().toString());
  };
  const removeMantra = (id: string) => {
    setMantras(ms => ms.filter(m => m.id !== id));
    if (activeMantraId === id && mantras.length > 1) {
      const next = mantras.find(m => m.id !== id);
      setActiveMantraId(next ? next.id : '');
    }
  };

  const recordRepetition = () => {
    if (!activeMantra || isPaused || !isActive || isComplete) return;
    setMantras(ms => ms.map(m => m.id === activeMantra.id ? { ...m, count: m.count + 1 } : m));
    setTotalSaid(t => t + 1);
    setBgIndex(i => (i + 1) % BACKGROUNDS.length);
    if (soundOn) tone();
  };

  useEffect(() => {
    if (totalRepetitions && totalSaid >= totalRepetitions) {
      complete();
    }
    if (timeTargetMs && elapsedMs >= timeTargetMs) {
      complete();
    }
  }, [totalSaid, elapsedMs]);

  const complete = () => {
    setIsComplete(true);
    setIsActive(false);
    if (user) {
      try {
        const completions = JSON.parse(localStorage.getItem(`completedExercises_${user.uid}`) || '[]');
        completions.push({
          exerciseId: 'mantra-meditation',
          exerciseName: 'Mantra Meditation',
          completedAt: new Date().toISOString(),
          repetitions: totalSaid,
          durationMs: elapsedMs,
          xpEarned: 15,
        });
        localStorage.setItem(`completedExercises_${user.uid}`, JSON.stringify(completions));
      } catch {}
    }
    onComplete?.();
  };

  const displayTime = () => {
    if (!timeTargetMs) return null;
    const remaining = Math.max(0, timeTargetMs - elapsedMs);
    const mm = Math.floor(remaining / 60000).toString().padStart(2,'0');
    const ss = Math.floor((remaining % 60000) / 1000).toString().padStart(2,'0');
    return `${mm}:${ss}`;
  };

  const mantraGuidance = 'Choose or create a present-tense mantra. Repeat it with steady rhythm. Keep language affirmative and in-the-now ("I am" not "I will"). Let distractions pass and return to the phrase.';

  return (
    <div className={"min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"}>
      {/* Color overlay that crossfades per repetition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgIndex}
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${BACKGROUNDS[bgIndex]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          style={{ mixBlendMode: 'screen' }}
        />
      </AnimatePresence>
      {/* Ambient creative layers */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 55 }, (_, i) => {
          const seed = i * 37.77;
          const x = (Math.sin(seed) * 0.5 + 0.5) * 100;
          const y = (Math.cos(seed) * 0.5 + 0.5) * 100;
          const size = 2 + (Math.sin(seed * 2.3) + 1) * 3;
          const delay = (i % 15) * 0.35;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-red-500/50 to-pink-500/10"
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
              transition={{ duration: 7 + (i % 6), repeat: Infinity, delay, ease: 'easeInOut' }}
            />
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.07),transparent_70%)]" />

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mantra Meditation</h1>
          <p className="text-gray-400 text-sm">Affirmation repetition practice</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
            aria-label={soundOn ? 'Mute sound cues' : 'Unmute sound cues'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
          </button>
          {onExit && (
            <button onClick={onExit} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Exit mantra meditation">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Top progress bar */}
      <div className="absolute top-24 w-full px-8">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
          <span>{totalRepetitions ? `Repetitions: ${totalSaid}/${totalRepetitions}` : 'Timed Session'}</span>
          {timeTargetMs && <span>{displayTime()}</span>}
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center flex-1 pt-36 w-full max-w-5xl">
        {/* Active mantra display */}
        <div className="mb-10 text-center space-y-4 w-full px-4 max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMantraId + isComplete}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              {!isComplete && <h2 className="text-4xl md:text-5xl font-bold text-red-300 tracking-tight mb-4">{activeMantra?.text || 'Select a Mantra'}</h2>}
              {!isComplete && <p className="text-gray-400 text-sm leading-relaxed">{mantraGuidance}</p>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mantra repetition visual */}
        {!isComplete && (
          <div className="relative mb-16">
            <div className="relative" style={{ width: 280, height: 280 }}>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <motion.circle
                  cx="50" cy="50" r="46" fill="none" stroke="url(#mantraGrad)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - sessionProgress) }}
                  transition={{ duration: 0.25, ease: 'linear' }}
                />
                <defs>
                  <linearGradient id="mantraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Pulsing center */}
              <motion.div
                className="absolute inset-0 m-auto rounded-full bg-red-600/30"
                animate={{ scale: isActive ? [1, 1.15, 1] : 1, opacity: isActive ? [0.5, 0.85, 0.5] : 0.4 }}
                transition={{ repeat: isActive ? Infinity : 0, duration: 4, ease: 'easeInOut' }}
                style={{ width: 180, height: 180 }}
              />
              {/* Floating repetition counters (ripples) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2 tabular-nums">{activeMantra?.count || 0}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-400">Repetitions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 bg-gray-800/80 backdrop-blur-sm rounded-xl p-10 border border-gray-700"
          >
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
            <h3 className="text-3xl font-bold text-white">Session Complete</h3>
            <p className="text-gray-300">You repeated your mantra {totalSaid} times.</p>
            {timeTargetMs && <p className="text-gray-400 text-sm">Duration: {(elapsedMs/1000).toFixed(0)}s</p>}
          </motion.div>
        )}

        {/* Mantra management & interactions */}
        {!isComplete && (
          <div className="w-full max-w-4xl grid lg:grid-cols-[1fr_320px] gap-10 mb-24">
            {/* Mantra list */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={mantraInput}
                  onChange={e => setMantraInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addMantra(); }}
                  placeholder="Add custom mantra (present tense)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button
                  onClick={addMantra}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mantras.map(m => {
                  const active = m.id === activeMantraId;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setActiveMantraId(m.id)}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group rounded-xl border text-left p-4 transition bg-white/5 hover:bg-white/10 backdrop-blur-sm ${active ? 'border-red-500/60 shadow-red-600/30 shadow-inner' : 'border-white/10'} overflow-hidden`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition bg-gradient-to-br from-red-600/30 to-transparent" />
                      <p className="font-medium text-sm text-white leading-snug mb-2">{m.text}</p>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-400">
                        <span>{m.count} reps</span>
                        {active && <span className="text-red-300">Active</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeMantra(m.id); }}
                        className="absolute top-2 right-2 p-1 rounded bg-black/40 text-gray-400 hover:text-white hover:bg-black/60"
                        aria-label="Remove mantra"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {/* Guidance + repetition button */}
            <div className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 text-sm text-gray-300 leading-relaxed">
                <p className="mb-3 font-semibold text-red-300 tracking-wide text-xs">Guidance</p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{mantraGuidance}</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                {!isActive && !isComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startSession}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition shadow-lg shadow-red-600/30"
                  >
                    <Play className="w-5 h-5" /> Start
                  </motion.button>
                )}
                {isActive && !isPaused && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseSession}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-medium transition"
                  >
                    <Pause className="w-5 h-5" /> Pause
                  </motion.button>
                )}
                {isPaused && !isComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resumeSession}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition"
                  >
                    <Play className="w-5 h-5" /> Resume
                  </motion.button>
                )}
                {(isActive || isPaused) && !isComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={recordRepetition}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-5 rounded-xl font-bold text-lg tracking-wide transition shadow-lg shadow-red-600/40"
                  >
                    <Sparkles className="w-5 h-5" /> Say Mantra
                  </motion.button>
                )}
                {(isActive || isPaused || isComplete) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetSession}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition"
                  >
                    <RotateCcw className="w-5 h-5" /> Reset
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MantraMeditation;
