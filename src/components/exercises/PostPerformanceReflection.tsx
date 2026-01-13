import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostPerformanceReflectionProps {
  onExit?: () => void;
  onComplete?: () => void;
}

interface ReflectionStep {
  id: string;
  title: string;
  prompt: string;
  placeholder?: string;
  helper?: string;
}

const STEPS: ReflectionStep[] = [
  {
    id: 'moments',
    title: 'Highlights',
    prompt: 'What went well during this performance? Identify specific moments, decisions, or sequences that you executed effectively.',
    placeholder: 'E.g. strong start, composure after early mistake, consistent breathing between plays',
    helper: 'Reinforce strengths by naming them precisely.'
  },
  {
    id: 'challenges',
    title: 'Challenges',
    prompt: 'What moments challenged you or felt below your standard? Briefly note what happened without harsh judgment.',
    placeholder: 'E.g. lost focus mid-way, rushed transition, negative self-talk surfaced',
    helper: 'Description over criticism. Stay objective.'
  },
  {
    id: 'emotions',
    title: 'Emotional Landscape',
    prompt: 'How did you feel at different phases (start, middle, pivotal moments, end)? Note shifts in confidence, calm, or frustration.',
    placeholder: 'Start: focused / Mid: tension rising / Key moment: nervous but reset with breath / Finish: relieved + proud',
    helper: 'Emotions are signals, not problems.'
  },
  {
    id: 'adjustments',
    title: 'Adjustments',
    prompt: 'If a similar situation arises next time, what specific adjustment or mental cue will you apply?',
    placeholder: 'E.g. 3-count exhale before serve; “commit – trust – release”; narrow focus on target',
    helper: 'Link challenge → adjustment → cue.'
  },
  {
    id: 'confidence',
    title: 'Confidence Rebuild',
    prompt: 'Complete this phrase: “Because I experienced this performance, I am now more capable of…”',
    placeholder: 'Staying composed in pressure points; resetting after errors; directing attention deliberately',
    helper: 'Confidence = evidence + interpretation.'
  },
];

const tone = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {}
};

const PostPerformanceReflection: React.FC<PostPerformanceReflectionProps> = ({ onExit, onComplete }) => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [responses, setResponses] = useState<Record<string,string>>({});
  const [completed, setCompleted] = useState(false);
  const [pastReflections, setPastReflections] = useState<any[]>([]);

  // Updated progress logic
  const activeProgress = (index + 1) / STEPS.length; // during steps
  const progress = completed ? 1 : activeProgress;
  const percent = Math.round(progress * 100);
  const current = STEPS[index];

  const handleChange = (val: string) => {
    setResponses(r => ({ ...r, [current.id]: val }));
  };

  const next = () => {
    if (index < STEPS.length - 1) {
      setIndex(i => i + 1);
      if (soundOn) tone();
    } else {
      finish();
    }
  };
  const prev = () => {
    setIndex(i => Math.max(0, i - 1));
    if (soundOn) tone();
  };

  const finish = () => {
    setCompleted(true);
    if (soundOn) tone();
    if (user) {
      try {
        const key = `completedExercises_${user.uid}`;
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        const entry = {
          exerciseId: 'post-performance-reflection',
          exerciseName: 'Post-Performance Reflection',
          completedAt: new Date().toISOString(),
          responses,
          xpEarned: 12,
        };
        completions.push(entry);
        localStorage.setItem(key, JSON.stringify(completions));
        setPastReflections(prev => [entry, ...prev]);
      } catch {}
    }
    onComplete?.();
  };

  // Load past reflections
  useEffect(() => {
    if (!user) return;
    try {
      const key = `completedExercises_${user.uid}`;
      const completions = JSON.parse(localStorage.getItem(key) || '[]');
      const past = completions.filter((c: any) => c.exerciseId === 'post-performance-reflection');
      setPastReflections(past.reverse());
    } catch {}
  }, [user]);

  useEffect(() => {
    // auto-focus text area when step changes
    const el = document.getElementById('reflection-textarea');
    if (el) el.focus();
  }, [index]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Overlay subtle gradient pulses */}
      <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.12),transparent_65%)]" />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Post-Performance Reflection</h1>
          <p className="text-gray-400 text-sm">Integrate experience → build confidence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-green-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />} {soundOn ? 'Sound' : 'Muted'}
          </button>
          {onExit && (
            <button onClick={onExit} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Exit reflection">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-24 w-full px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
          <span>{completed ? 'Summary' : `Step ${index + 1} of ${STEPS.length}`}</span>
          <div className="flex items-center gap-4">
            <span>{percent}%</span>
            <button
              onClick={() => setSoundOn(s => !s)}
              className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
            >
              {soundOn ? <Volume2 className="w-3 h-3 text-green-300" /> : <VolumeX className="w-3 h-3 text-gray-400" />} {soundOn ? 'Mute' : 'Unmute'}
            </button>
          </div>
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl pt-40 pb-24">
        {!completed && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">{current.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-3xl">{current.prompt}</p>
              {current.helper && <p className="text-xs text-red-300 mb-4 uppercase tracking-wide">{current.helper}</p>}
              <textarea
                id="reflection-textarea"
                value={responses[current.id] || ''}
                onChange={e => handleChange(e.target.value)}
                className="w-full min-h-[160px] rounded-xl bg-white/5 border border-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/30 outline-none p-4 text-sm placeholder-gray-500 resize-vertical"
                placeholder={current.placeholder}
              />
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${index === 0 ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-white/10 text-gray-200 hover:bg-white/10'}`}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors"
                >
                  {index === STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 bg-gray-800/70 backdrop-blur-sm rounded-xl p-10 border border-gray-700"
          >
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
            <h3 className="text-3xl font-bold text-white">Reflection Complete</h3>
            <p className="text-gray-300 max-w-md mx-auto">Confidence grows when you convert experience into learning. Come back to this reflection before your next performance.</p>
            <div className="grid sm:grid-cols-2 gap-4 text-left text-sm max-w-2xl mx-auto mt-6">
              {STEPS.map(s => (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-red-300 font-semibold text-xs uppercase tracking-wide mb-1">{s.title}</p>
                  <p className="text-gray-300 whitespace-pre-wrap max-h-40 overflow-auto text-xs leading-relaxed">{responses[s.id] || '—'}</p>
                </div>
              ))}
            </div>
            {pastReflections.length > 1 && (
              <div className="text-left pt-8 mt-8 border-t border-white/10 max-w-4xl mx-auto">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-red-300 mb-4">Past Reflections ({pastReflections.length - 1})</h4>
                <div className="space-y-4 max-h-96 overflow-auto pr-2">
                  {pastReflections.slice(1).map((entry, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 text-xs space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-300 mb-2 pb-2 border-b border-white/10">
                        <span className="font-semibold">Reflection #{pastReflections.length - idx - 1}</span>
                        <span className="text-gray-400">{new Date(entry.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="space-y-3">
                        {STEPS.map(s => (
                          <div key={s.id} className="bg-black/20 rounded-md p-3 border border-white/5">
                            <p className="text-red-300 font-semibold mb-1.5 text-xs uppercase tracking-wide">{s.title}</p>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{entry.responses?.[s.id] || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PostPerformanceReflection;
