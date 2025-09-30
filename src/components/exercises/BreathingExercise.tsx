import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Trophy } from 'lucide-react';

interface BreathingPhase {
  name: string;
  duration: number; // in milliseconds
  instruction: string;
  color: string; // Tailwind gradient class
}

interface BreathingExerciseProps {
  title: string;
  subtitle?: string;
  phases: BreathingPhase[];
  totalRounds?: number;
  onComplete?: () => void;
  onExit?: () => void;
  showInstructions?: boolean;
}

interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: string;
  phaseIndex: number;
  currentRound: number;
  timeRemaining: number;
  isComplete: boolean;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  title,
  subtitle,
  phases,
  totalRounds = 4,
  onComplete,
  onExit,
  showInstructions = false,
}) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    isPaused: false,
    currentPhase: phases[0]?.name || 'Ready',
    phaseIndex: 0,
    currentRound: 1,
    timeRemaining: phases[0]?.duration || 4000,
    isComplete: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Start/Resume breathing session
  const startBreathing = () => {
    setSessionState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
    }));
    startTimeRef.current = Date.now();
  };

  // Pause breathing session
  const pauseBreathing = () => {
    setSessionState(prev => ({
      ...prev,
      isPaused: true,
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Restart breathing session
  const restartBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSessionState({
      isActive: false,
      isPaused: false,
      currentPhase: phases[0]?.name || 'Ready',
      phaseIndex: 0,
      currentRound: 1,
      timeRemaining: phases[0]?.duration || 4000,
      isComplete: false,
    });
  };

  // Handle phase progression
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused || sessionState.isComplete || phases.length === 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const currentPhaseDuration = phases[sessionState.phaseIndex]?.duration || 4000;
      const remaining = currentPhaseDuration - (elapsed % currentPhaseDuration);

      if (remaining <= 50) { // Small buffer for smooth transitions
        setSessionState(prev => {
          const nextPhaseIndex = (prev.phaseIndex + 1) % phases.length;
          const isNewRound = nextPhaseIndex === 0;
          const newRound = isNewRound ? prev.currentRound + 1 : prev.currentRound;

          // Check if session is complete
          if (newRound > totalRounds && nextPhaseIndex === 0) {
            return {
              ...prev,
              isComplete: true,
              isActive: false,
            };
          }

          const nextPhase = phases[nextPhaseIndex];
          return {
            ...prev,
            phaseIndex: nextPhaseIndex,
            currentPhase: nextPhase?.name || 'Ready',
            currentRound: newRound,
            timeRemaining: nextPhase?.duration || 4000,
          };
        });
        startTimeRef.current = now;
      } else {
        setSessionState(prev => ({
          ...prev,
          timeRemaining: remaining,
        }));
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.isComplete, phases, totalRounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Complete session
  useEffect(() => {
    if (sessionState.isComplete && onComplete) {
      onComplete();
    }
  }, [sessionState.isComplete, onComplete]);

  // Calculate progress
  const currentPhaseDuration = phases[sessionState.phaseIndex]?.duration || 4000;
  const phaseProgress = ((currentPhaseDuration - sessionState.timeRemaining) / currentPhaseDuration) * 100;
  const totalProgress = ((sessionState.currentRound - 1) * phases.length + sessionState.phaseIndex + (phaseProgress / 100)) / (totalRounds * phases.length) * 100;

  // Get breathing circle animation values
  const getCircleScale = () => {
    const currentPhase = phases[sessionState.phaseIndex];
    if (!currentPhase) return 1;

    // Customize based on phase name
    if (currentPhase.name.toLowerCase().includes('inhale')) {
      return 1 + (phaseProgress / 100) * 0.8; // Scale from 1 to 1.8
    } else if (currentPhase.name.toLowerCase().includes('hold')) {
      return currentPhase.name.toLowerCase().includes('empty') ? 1 : 1.8; // Hold at size
    } else if (currentPhase.name.toLowerCase().includes('exhale')) {
      return 1.8 - (phaseProgress / 100) * 0.8; // Scale from 1.8 to 1
    }
    return 1;
  };

  const getCurrentPhaseColor = () => {
    return phases[sessionState.phaseIndex]?.color || 'from-red-500 to-red-400';
  };

  // Completion screen
  if (sessionState.isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Excellent Work!
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-2"
          >
            You completed {totalRounds} rounds of {title.toLowerCase()}
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-sm mb-8"
          >
            Your mind and body are now more centered and focused
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={restartBreathing}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Return to Exercises
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div className="text-white">
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
        <button
          onClick={onExit}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-20 left-6 right-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Round {sessionState.currentRound} of {totalRounds}</span>
          <span className="text-gray-400 text-sm">{Math.round(totalProgress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-red-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Breathing Interface */}
      <div className="flex flex-col items-center justify-center flex-1">
        {!sessionState.isActive ? (
          // Start Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-64 h-64 rounded-full border-4 border-gray-700 flex items-center justify-center mb-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Begin?</h3>
                <p className="text-gray-400 text-sm">Find a comfortable position</p>
              </div>
            </div>
            <button
              onClick={startBreathing}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              <span className="font-medium">Start Breathing</span>
            </button>
          </motion.div>
        ) : (
          // Active Breathing Interface
          <div className="relative">
            {/* Breathing Circle */}
            <motion.div
              className={`w-64 h-64 rounded-full bg-gradient-to-br ${getCurrentPhaseColor()} opacity-20`}
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: currentPhaseDuration / 1000,
                ease: phases[sessionState.phaseIndex]?.name.toLowerCase().includes('hold') ? 'linear' : 'easeInOut',
              }}
            />
            
            {/* Inner Circle with Phase Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={sessionState.currentPhase}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold text-white mb-2"
                  >
                    {sessionState.currentPhase}
                  </motion.h3>
                </AnimatePresence>
                
                <div className="text-2xl font-mono text-gray-400">
                  {Math.ceil(sessionState.timeRemaining / 1000)}
                </div>

                {/* Phase instruction */}
                {phases[sessionState.phaseIndex]?.instruction && (
                  <motion.p
                    key={sessionState.phaseIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-sm mt-2"
                  >
                    {phases[sessionState.phaseIndex].instruction}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="#EF4444"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${2 * Math.PI * 120}` }}
                animate={{
                  strokeDasharray: `${(phaseProgress / 100) * 2 * Math.PI * 120} ${2 * Math.PI * 120}`,
                }}
                transition={{ duration: 0.1 }}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Controls */}
      {sessionState.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-4 mt-8"
        >
          <button
            onClick={sessionState.isPaused ? startBreathing : pauseBreathing}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {sessionState.isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            )}
          </button>
          
          <button
            onClick={restartBreathing}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </motion.div>
      )}

      {/* Pause Overlay */}
      <AnimatePresence>
        {sessionState.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 text-center"
            >
              <h3 className="text-xl font-bold text-white mb-2">Paused</h3>
              <p className="text-gray-400 mb-4">Take your time</p>
              <button
                onClick={startBreathing}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreathingExercise;
