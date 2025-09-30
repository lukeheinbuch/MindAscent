import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckSquare, Save, ArrowRight, RotateCcw } from 'lucide-react';
import Slider from '@/components/Slider';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInService } from '@/services/checkIn';
import { CheckInFormData } from '@/types';
import { getMoodEmoji, getStressManagementEmoji, getEnergyEmoji, getMotivationEmoji } from '@/utils';

interface CheckInScreenProps {
  onNavigate?: (path: string) => void;
  onComplete?: () => void;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ onNavigate, onComplete }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<CheckInFormData>({
    mood: 3,
    stress_management: 3,
    energy: 3,
    motivation: 3,
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasExistingCheckIn, setHasExistingCheckIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      if (onNavigate) {
        onNavigate('/login');
      } else {
        router.push('/login');
      }
      return;
    }

    checkForExistingCheckIn();
  }, [user, authLoading, router, onNavigate]);

  const checkForExistingCheckIn = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await CheckInService.getCheckIn(user.uid, today);
      
      if (existing) {
        setHasExistingCheckIn(true);
        setFormData({
          mood: existing.mood,
          stress_management: existing.stress_management,
          energy: existing.energy,
          motivation: existing.motivation,
          notes: existing.notes || '',
        });
      }
    } catch (error) {
      console.error('Error checking existing check-in:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to save your check-in.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const checkInData = {
        mood: formData.mood,
        stress_management: formData.stress_management,
        energy: formData.energy,
        motivation: formData.motivation,
        notes: formData.notes,
        date: today,
      };
      
      await CheckInService.saveCheckIn(user.uid, checkInData);
      
      setShowSuccess(true);
      
      // Auto-navigate after success
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else if (onNavigate) {
          onNavigate('/exercises?checkInComplete=true');
        } else {
          router.push('/exercises?checkInComplete=true');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error saving check-in:', error);
      setError('Failed to save your check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mood: 3,
      stress_management: 3,
      energy: 3,
      motivation: 3,
      notes: '',
    });
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Check-in Complete! 🎉</h2>
          <p className="text-gray-400 mb-8">
            Great job staying consistent with your mental training. Your progress has been saved.
          </p>
          <div className="animate-pulse text-gray-400 text-sm">
            Redirecting to exercises...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {hasExistingCheckIn ? "Update Today's Check-in" : "Daily Check-in"}
        </h1>
        <p className="text-gray-400">
          {hasExistingCheckIn 
            ? "You can update your check-in throughout the day" 
            : "Take a moment to assess your current mental state"
          }
        </p>
      </motion.div>

      {/* Check-in Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="space-y-8">
          {/* Mood Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium text-white">Mood</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getMoodEmoji(formData.mood)}</span>
                <span className="text-gray-400">{formData.mood}/5</span>
              </div>
            </div>
            <Slider
              label=""
              value={formData.mood}
              onChange={(value) => setFormData({ ...formData, mood: value })}
              min={1}
              max={5}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Stress Management Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium text-white">Stress Management</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getStressManagementEmoji(formData.stress_management)}</span>
                <span className="text-gray-400">{formData.stress_management}/10</span>
              </div>
            </div>
            <Slider
              label=""
              value={formData.stress_management}
              onChange={(value) => setFormData({ ...formData, stress_management: value })}
              min={1}
              max={10}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Very Stressed</span>
              <span>Excellent Management</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium text-white">Energy Level</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getEnergyEmoji(formData.energy)}</span>
                <span className="text-gray-400">{formData.energy}/5</span>
              </div>
            </div>
            <Slider
              label=""
              value={formData.energy}
              onChange={(value) => setFormData({ ...formData, energy: value })}
              min={1}
              max={5}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Motivation Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium text-white">Motivation</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getMotivationEmoji(formData.motivation)}</span>
                <span className="text-gray-400">{formData.motivation}/5</span>
              </div>
            </div>
            <Slider
              label=""
              value={formData.motivation}
              onChange={(value) => setFormData({ ...formData, motivation: value })}
              min={1}
              max={5}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Unmotivated</span>
              <span>Highly Motivated</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-lg font-medium text-white mb-4 block">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How are you feeling? What's on your mind? Any specific concerns or goals?"
              className="w-full h-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-red-500"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {(formData.notes || '').length}/500
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasExistingCheckIn ? 'Update Check-in' : 'Save Check-in'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CheckInScreen;
