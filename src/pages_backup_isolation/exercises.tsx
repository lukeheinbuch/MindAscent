import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Activity, Clock, User, CheckCircle, Play, Filter } from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import Loading from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/types';
import { exercisesData, getExercisesByCategory } from '@/data/placeholderData';
import { getDifficultyColor, formatDuration, capitalize } from '@/utils';
import { gamificationService } from '@/services/gamification';

const ExercisesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { checkInComplete } = router.query;
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [exercises, setExercises] = useState<Exercise[]>(exercisesData);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterExercises();
  }, [selectedCategory, selectedDifficulty]);

  const filterExercises = () => {
    let filtered = exercisesData;

    if (selectedCategory !== 'all') {
      filtered = getExercisesByCategory(selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setExercises(filtered);
  };

  const handleExerciseClick = async (exerciseId: string) => {
    if (user?.id) {
      try {
        await gamificationService.recordExerciseAccess(user.id, exerciseId);
      } catch (e) {
        // swallow
      }
    }
    // Special handling for interactive exercises
    if (exerciseId === 'box-breathing') {
      router.push('/exercises/box-breathing');
      return;
    }
    if (exerciseId === 'body-scan') {
      router.push('/exercises/body-scan');
      return;
    }
    if (exerciseId === 'mantra-meditation' || exerciseId === 'mantra') {
      router.push('/mantra');
      return;
    }
    if (exerciseId === 'post-performance-reflection') {
      router.push('/reflection');
      return;
    }
    if (exerciseId === 'progressive-muscle-relaxation') {
      router.push('/pmr');
      return;
    }
    if (exerciseId === 'gratitude-journal') {
      router.push('/gratitude');
      return;
    }
    if (exerciseId === 'five-senses-awareness') {
      router.push('/five-senses');
      return;
    }
    if (exerciseId === 'visualization') {
      router.push('/visualization');
      return;
    }
    if (exerciseId === 'open-awareness') {
      router.push('/open-awareness');
      return;
    }
    router.push(`/exercises/${exerciseId}`);
  };

  const categories = [
    { value: 'all', label: 'All Exercises' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'visualization', label: 'Visualization' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'stress-relief', label: 'Stress Relief' },
    { value: 'focus', label: 'Focus' },
    { value: 'recovery', label: 'Recovery' },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  if (authLoading) {
    return (
      <Layout title="Mental Training Exercises">
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading exercises..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Mental Training Exercises">
      <PageContainer
        title="Exercises"
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Mental Training <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Arsenal</span></h1>}
        subtitle="Guided routines to support your mental health and performance at any level."
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {checkInComplete && (
              <div className="bg-red-600/20 border border-red-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-red-400 font-bold text-lg">Check-in Complete!</h3>
                    <p className="text-gray-300">
                      Outstanding work! Now amplify your performance with these targeted exercises.
                    </p>
                  </div>
                </div>
              </div>
            )}

  </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card mb-10"
        >
          <div className="flex items-center mb-4">
            <Filter className="text-gray-400 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-white">Filter Exercises</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    type="button"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDifficulty(d.value)}
                    type="button"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedDifficulty === d.value
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dark-300">
            <p className="text-sm text-gray-400">
              Showing {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>

  {/* Exercises Grid */}
        <div className="px-1 sm:px-2 pb-2 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              className="card hover:border-primary-500/50 transition-colors cursor-pointer group h-full"
              onClick={() => handleExerciseClick(exercise.id)}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {exercise.title}
                    </h3>
                    {(exercise.id === 'box-breathing' || exercise.id === 'body-scan' || exercise.id === 'mantra-meditation' || exercise.id === 'post-performance-reflection' || exercise.id === 'progressive-muscle-relaxation' || exercise.id === 'gratitude-journal' || exercise.id === 'five-senses-awareness' || exercise.id === 'visualization' || exercise.id === 'open-awareness') && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Interactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {exercise.description}
                  </p>
                </div>
                <Play className="text-gray-500 group-hover:text-primary-500 transition-colors ml-2 flex-shrink-0" size={20} />
              </div>

              {/* Exercise Meta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(exercise.duration)}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <User size={16} className="mr-1" />
                    <span className={getDifficultyColor(exercise.difficulty)}>
                      {capitalize(exercise.difficulty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-block bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                  {capitalize(exercise.category.replace('-', ' '))}
                </span>
                <div className="flex items-center text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium mr-1">Start</span>
                  <Play size={16} />
                </div>
              </div>

              {/* Benefits Preview */}
              <div className="mt-4 pt-4 border-t border-dark-300">
                <p className="text-xs text-gray-500 mb-2">Key Benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.benefits.slice(0, 2).map((benefit, i) => (
                    <span key={i} className="text-xs text-gray-400 bg-dark-500 px-2 py-1 rounded">
                      {benefit.length > 20 ? `${benefit.substring(0, 20)}...` : benefit}
                    </span>
                  ))}
                  {exercise.benefits.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{exercise.benefits.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Empty State */}
        {exercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Activity className="text-gray-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No exercises found</h3>
            <p className="text-gray-500">
              Try adjusting your filters to find exercises that match your preferences.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="btn-primary mt-4"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

  {/* Removed bottom call-to-action card as requested */}
      </PageContainer>
    </Layout>
  );
};

export default ExercisesPage;
