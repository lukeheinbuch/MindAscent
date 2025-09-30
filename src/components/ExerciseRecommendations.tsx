import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckInData, Exercise } from '@/types';
import { Brain, Heart, Zap, Target, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface ExerciseRecommendationProps {
  checkInData: CheckInData;
  onExerciseSelect: (exercise: Exercise) => void;
  className?: string;
}

interface RecommendationCard {
  exercise: Exercise;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const ExerciseRecommendations: React.FC<ExerciseRecommendationProps> = ({
  checkInData,
  onExerciseSelect,
  className = '',
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Generate recommendations based on check-in scores
  const generateRecommendations = (): RecommendationCard[] => {
    const recommendations: RecommendationCard[] = [];
    const { mood, stress_management, energy, motivation } = checkInData;

    // Low stress management recommendations (poor stress management = low score)
    if (stress_management <= 4) {
      recommendations.push({
        exercise: {
          id: 'breathing-1',
          title: '4-7-8 Breathing Technique',
          description: 'A powerful breathing exercise to calm your nervous system and improve stress management.',
          category: 'breathing',
          duration: 5,
          difficulty: 'beginner',
          instructions: [
            'Find a comfortable seated position',
            'Inhale through your nose for 4 counts',
            'Hold your breath for 7 counts',
            'Exhale through your mouth for 8 counts',
            'Repeat 4-6 cycles'
          ],
          benefits: ['Reduces stress', 'Calms nervous system', 'Improves focus'],
          tags: ['stress-relief', 'breathing', 'quick', 'beginner-friendly']
        },
        reason: 'Your stress management could use some support today. This breathing technique helps activate your parasympathetic nervous system.',
        priority: 'high'
      });
    }

    // Low motivation recommendations
    if (motivation <= 2) {
      recommendations.push({
        exercise: {
          id: 'confidence-1',
          title: 'Power Pose & Affirmations',
          description: 'Boost your confidence and motivation with body language and positive self-talk.',
          category: 'confidence',
          duration: 3,
          difficulty: 'beginner',
          instructions: [
            'Stand tall with feet shoulder-width apart',
            'Place hands on hips or raise arms in victory pose',
            'Hold for 2 minutes while breathing deeply',
            'Repeat: "I am strong, capable, and ready"',
            'Visualize yourself succeeding'
          ],
          benefits: ['Increases confidence', 'Boosts motivation', 'Improves mood'],
          tags: ['confidence', 'motivation', 'quick', 'affirmations']
        },
        reason: 'Your motivation is low today. Power poses can increase testosterone and reduce cortisol.',
        priority: 'high'
      });
    }

    // Low energy recommendations
    if (energy <= 2) {
      recommendations.push({
        exercise: {
          id: 'mindfulness-1',
          title: 'Energy Reset Meditation',
          description: 'A quick mindfulness practice to restore mental clarity and energy.',
          category: 'mindfulness',
          duration: 7,
          difficulty: 'beginner',
          instructions: [
            'Sit comfortably with eyes closed',
            'Take 3 deep breaths to center yourself',
            'Scan your body for tension and release it',
            'Visualize golden energy flowing through you',
            'Set an intention for renewed energy'
          ],
          benefits: ['Restores energy', 'Improves focus', 'Reduces fatigue'],
          tags: ['energy', 'mindfulness', 'meditation', 'restoration']
        },
        reason: 'Your energy is low today. This meditation helps reset your mental state and restore vitality.',
        priority: 'medium'
      });
    }

    // Low mood recommendations
    if (mood <= 2) {
      recommendations.push({
        exercise: {
          id: 'visualization-1',
          title: 'Gratitude & Success Visualization',
          description: 'Lift your spirits with gratitude practice and positive visualization.',
          category: 'visualization',
          duration: 8,
          difficulty: 'beginner',
          instructions: [
            'Think of 3 things you\'re grateful for today',
            'Visualize a recent accomplishment in detail',
            'Imagine yourself achieving a current goal',
            'Feel the emotions of success and joy',
            'Carry this feeling with you'
          ],
          benefits: ['Improves mood', 'Increases optimism', 'Builds resilience'],
          tags: ['gratitude', 'visualization', 'mood-boost', 'positivity']
        },
        reason: 'Your mood could use a boost. Gratitude and visualization activate positive neural pathways.',
        priority: 'medium'
      });
    }

    // Multiple low scores - general wellness
    const lowScores = [mood, stress_management, energy, motivation].filter(score => score <= 4).length;
    if (lowScores >= 2) {
      recommendations.push({
        exercise: {
          id: 'recovery-1',
          title: 'Complete Mental Reset',
          description: 'A comprehensive exercise combining breathing, mindfulness, and positive imagery.',
          category: 'recovery',
          duration: 12,
          difficulty: 'intermediate',
          instructions: [
            'Begin with 5 minutes of deep breathing',
            'Practice body scan meditation',
            'Visualize your ideal performance state',
            'Set 3 small, achievable goals',
            'End with self-compassion practice'
          ],
          benefits: ['Comprehensive reset', 'Builds resilience', 'Improves overall well-being'],
          tags: ['recovery', 'comprehensive', 'resilience', 'well-being']
        },
        reason: 'Multiple areas need attention today. This comprehensive exercise addresses overall mental wellness.',
        priority: 'high'
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 3); // Limit to top 3 recommendations
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'breathing': return <Heart className="w-5 h-5" />;
      case 'mindfulness': return <Brain className="w-5 h-5" />;
      case 'confidence': return <Target className="w-5 h-5" />;
      case 'visualization': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-900/20 border border-green-500 rounded-lg p-6 ${className}`}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Great Job Today!</h3>
          <p className="text-gray-300">
            Your check-in scores look excellent! Keep up the great work and maintain your positive momentum.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-2">Recommended for You</h2>
        <p className="text-gray-400">Based on your check-in, here are some exercises that could help:</p>
      </motion.div>

      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`border rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] ${getPriorityColor(rec.priority)}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                {getIcon(rec.exercise.category)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{rec.exercise.title}</h3>
                <p className="text-sm text-gray-400 capitalize">{rec.exercise.category} • {rec.exercise.duration} min</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              rec.priority === 'high' ? 'bg-red-600 text-white' :
              rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              {rec.priority} priority
            </span>
          </div>

          <p className="text-gray-300 mb-4">{rec.exercise.description}</p>

          {/* Why recommended */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">Why this was recommended:</h4>
            <p className="text-sm text-gray-300">{rec.reason}</p>
          </div>

          {/* Expandable details */}
          <div>
            <button
              onClick={() => setExpandedCard(expandedCard === rec.exercise.id ? null : rec.exercise.id)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <span>View Instructions & Benefits</span>
              {expandedCard === rec.exercise.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {expandedCard === rec.exercise.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <h5 className="text-sm font-medium text-white mb-2">Instructions:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                      {rec.exercise.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white mb-2">Benefits:</h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.exercise.benefits.map((benefit, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action button */}
          <button
            onClick={() => onExerciseSelect(rec.exercise)}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Exercise</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default ExerciseRecommendations;
