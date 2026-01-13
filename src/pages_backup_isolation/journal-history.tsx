import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

interface JournalEntry {
  exerciseId: string;
  exerciseName: string;
  completedAt: string;
  responses?: Record<string, string>;
  note?: string;
  xpEarned?: number;
}

const JournalHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadEntries = async () => {
      try {
        // Get check-ins with journal entries only
        const { data: checkInsData, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          return;
        }

        // Filter for entries with non-empty notes
        const checkInEntries = (checkInsData || [])
          .filter((ci: any) => ci.note && ci.note.trim().length > 0)
          .map((ci: any) => ({
            exerciseId: 'check-in-journal',
            exerciseName: 'Daily Check-in Journal',
            completedAt: ci.created_at || ci.date,
            note: ci.note,
            responses: {},
          }));

        setEntries(checkInEntries);
      } catch (e) {
        console.error('Failed to load journal entries:', e);
      }
    };
    
    loadEntries();
  }, [user?.id]);

  const getPreview = (entry: JournalEntry): string => {
    if (entry.note) {
      return entry.note.length > 100 ? `${entry.note.substring(0, 100)}...` : entry.note;
    }
    const responses = entry.responses || {};
    const values = Object.values(responses);
    if (values.length === 0) return 'No content';
    const firstValue = values[0] || '';
    return firstValue.length > 100 ? `${firstValue.substring(0, 100)}...` : firstValue;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepLabels = (exerciseId: string): string[] => {
    if (exerciseId === 'post-performance-reflection') {
      return ['Highlights', 'Challenges', 'Emotional Landscape', 'Adjustments', 'Confidence Rebuild'];
    }
    if (exerciseId === 'gratitude-journal') {
      return ['Grateful For', 'Proud Of', 'Affirmation'];
    }
    return [];
  };

  return (
    <Layout title="Journal History">
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-6">
        {/* Header */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/progress')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to progress"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                  Journal History
                </h1>
                <p className="text-gray-400 text-sm mt-1">Your reflections and insights over time</p>
              </div>
            </div>
          </motion.div>

          {/* Entries List */}
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-300 mb-2">No Journal Entries Yet</h2>
              <p className="text-gray-500">Complete reflection exercises to start building your journal.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-gradient-to-br from-gray-900/70 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-900/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{entry.exerciseName}</h3>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(entry.completedAt)}</p>
                    </div>
                    <div className="text-purple-400 text-sm">View</div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{getPreview(entry)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Full Entry Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEntry(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedEntry.exerciseName}</h2>
                    <p className="text-gray-400 text-sm mt-1">{formatDate(selectedEntry.completedAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedEntry.note ? (
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                      <h4 className="text-purple-300 font-semibold text-sm uppercase tracking-wide mb-2">Journal Entry</h4>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedEntry.note}</p>
                    </div>
                  ) : (
                    Object.entries(selectedEntry.responses || {}).map(([key, value], idx) => {
                      const labels = getStepLabels(selectedEntry.exerciseId);
                      const label = labels[idx] || key;
                      return (
                        <div key={key} className="bg-black/20 rounded-lg p-4 border border-white/5">
                          <h4 className="text-purple-300 font-semibold text-sm uppercase tracking-wide mb-2">{label}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default JournalHistoryPage;
