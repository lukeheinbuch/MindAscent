import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Volume2, VolumeX, RotateCcw, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface GratitudeJournalProps {
  onExit?: () => void;
  onComplete?: () => void;
}

const tone = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {}
};

const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ onExit, onComplete }) => {
  const { user } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [step, setStep] = useState(0); // 0: intro, 1: gratitude entries, 2: proud entries, 3: optional affirmation, 4: summary
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [proud, setProud] = useState(['', '', '']);
  const [affirmation, setAffirmation] = useState('');
  const [pastEntries, setPastEntries] = useState<any[]>([]);
  const totalSteps = 5; // intro -> gratitude -> proud -> affirmation -> summary

  const playTone = () => { if (soundOn) tone(); };

  const progress = Math.min(1, step / (totalSteps - 1));

  const canContinue = () => {
    if (step === 1) return gratitudes.some(g => g.trim().length > 0);
    if (step === 2) return proud.some(p => p.trim().length > 0);
    if (step === 3) return true; // affirmation optional
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      playTone();
    }
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const reset = () => {
    setStep(0);
    setGratitudes(['', '', '']);
    setProud(['', '', '']);
    setAffirmation('');
  };

  // Load past gratitude entries on mount / user change
  useEffect(() => {
    if (!user) return;
    try {
      const key = `completedExercises_${user.uid}`;
      const completions = JSON.parse(localStorage.getItem(key) || '[]');
      const past = completions.filter((c: any) => c.exerciseId === 'gratitude-journal');
      setPastEntries(past.reverse()); // newest first
    } catch {}
  }, [user]);

  useEffect(() => {
    if (step === 4) {
      if (user) {
        try {
          const key = `completedExercises_${user.uid}`;
          const completions = JSON.parse(localStorage.getItem(key) || '[]');
          const entry = {
            exerciseId: 'gratitude-journal',
            exerciseName: 'Gratitude Journal',
            completedAt: new Date().toISOString(),
            entries: {
              gratitudes: gratitudes.filter(g => g.trim()),
              proud: proud.filter(p => p.trim()),
              affirmation: affirmation.trim() || null,
            },
            xpEarned: 10,
          };
            completions.push(entry);
          localStorage.setItem(key, JSON.stringify(completions));
          setPastEntries(prev => [entry, ...prev]);
        } catch {}
      }
      onComplete?.();
      playTone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">{children}</h2>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Ambient subtle particles */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-500/40 to-transparent"
            style={{
              left: `${(Math.sin(i * 13.7) * 0.5 + 0.5) * 100}%`,
              top: `${(Math.cos(i * 17.1) * 0.5 + 0.5) * 100}%`,
              width: 4 + (i % 6),
              height: 4 + (i % 6)
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
            transition={{ duration: 7 + (i % 5), repeat: Infinity, delay: (i % 10) * 0.35 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gratitude Journal</h1>
          <p className="text-gray-400 text-sm">Anchor small wins. Rewire attention toward what serves you.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-colors"
          >
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
          <span>{step === totalSteps - 1 ? 'Complete' : `Step ${Math.min(step + 1, totalSteps - 1)} of ${totalSteps - 1}`}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.25, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-48 pb-24 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="w-full"
          >
            {step === 0 && (
              <div className="text-center">
                <SectionTitle>Shift Your Lens</SectionTitle>
                <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8">
                  Oftentimes, as athletes, we’re so focused on the bigger picture that we forget to celebrate the small victories, which can lead us to get too much into our heads or feel frustration because we haven’t reached the big goal yet.
                </p>
                <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8">
                  After training or competition, jot down three things you’re grateful for. You can also write down three things you’re proud of yourself for. This builds a positive mindset, self-compassion, focus, clarity, and relaxation.
                </p>
              </div>
            )}

            {step === 1 && (
              <div>
                <SectionTitle>3 Things You’re Grateful For</SectionTitle>
                <div className="space-y-4">
                  {gratitudes.map((g, i) => (
                    <input
                      key={i}
                      value={g}
                      onChange={e => setGratitudes(arr => { const copy = [...arr]; copy[i] = e.target.value; return copy; })}
                      placeholder={`Gratitude ${i + 1}`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <SectionTitle>3 Things You’re Proud Of</SectionTitle>
                <div className="space-y-4">
                  {proud.map((p, i) => (
                    <input
                      key={i}
                      value={p}
                      onChange={e => setProud(arr => { const copy = [...arr]; copy[i] = e.target.value; return copy; })}
                      placeholder={`Proud of ${i + 1}`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <SectionTitle>Optional: Integrate</SectionTitle>
                <p className="text-gray-300 text-sm mb-6">Write one short phrase or affirmation combining a gratitude or strength (e.g. "I carry today’s calm focus forward").</p>
                <input
                  value={affirmation}
                  onChange={e => setAffirmation(e.target.value)}
                  placeholder="Affirmation (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500"
                />
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-10 border border-gray-700">
                <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
                <h3 className="text-3xl font-bold text-white">Entry Saved</h3>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-red-300 mb-2">Gratitudes</h4>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc pl-4">
                      {gratitudes.filter(g => g.trim()).map((g,i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-red-300 mb-2">Proud Of</h4>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc pl-4">
                      {proud.filter(p => p.trim()).map((p,i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
                {affirmation.trim() && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-red-300 mb-2">Affirmation</h4>
                    <p className="text-gray-200 text-sm italic">{affirmation}</p>
                  </div>
                )}
                {pastEntries.length > 0 && (
                  <div className="pt-8 mt-4 border-t border-white/10 text-left">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-red-300 mb-4">Previous Entries</h4>
                    <div className="space-y-4 max-h-72 overflow-auto pr-2">
                      {pastEntries.slice(1).map((entry, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-400">
                            <span>{new Date(entry.completedAt).toLocaleString()}</span>
                            {entry.entries.affirmation && <span className="text-red-300">Affirmation</span>}
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-red-300 font-semibold mb-1">Gratitudes</p>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {entry.entries.gratitudes.map((g: string, gi: number) => <li key={gi}>{g}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="text-red-300 font-semibold mb-1">Proud Of</p>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {entry.entries.proud.map((p: string, pi: number) => <li key={pi}>{p}</li>)}
                              </ul>
                            </div>
                          </div>
                          {entry.entries.affirmation && <p className="italic text-gray-300">“{entry.entries.affirmation}”</p>}
                        </div>
                      ))}
                      {pastEntries.length === 1 && (
                        <p className="text-gray-500 text-xs">This is your first saved entry. Future entries will appear here.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-12 flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
          {step < 4 && (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={next}
                disabled={!canContinue()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 disabled:opacity-40 disabled:cursor-not-allowed hover:from-red-600 hover:to-red-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-red-600/30"
              >
                {step === 3 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-medium transition"
              >
                <RotateCcw className="w-5 h-5" /> New Entry
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-4 rounded-xl font-semibold transition"
                >
                  Exit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal;
