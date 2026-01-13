'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckSquare, Save, ArrowRight, Edit3 } from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import CustomSlider from '@/components/CustomSlider';
import SegmentedControl from '@/components/SegmentedControl';
import ToggleSwitch from '@/components/ToggleSwitch';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { useToast } from '@/components/Toast';
import { CheckInService } from '@/services/checkins';
import { CheckInFormData, CheckIn } from '@/types/checkin';
// Removed dynamic changing icons for a cleaner UI

const CheckInPageContent: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [formData, setFormData] = useState<CheckInFormData>({
    mood: 5,
    stress_management: 5,
    energy: 5,
    motivation: 5,
  confidence: 5,
    sleep: 5,
    focus: 5,
  recovery: 5,
    trainingLoad: 'none',
    preCompetition: false,
    note: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [todayStatus, setTodayStatus] = useState<{ checkedIn: boolean; checkIn?: CheckIn } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userId = (user as any)?.id || (user as any)?.uid;
    if (!userId) return;
    checkTodayStatus();
  }, [user]);

  const checkTodayStatus = async () => {
    if (!user) return;
    const userId = (user as any)?.id || (user as any)?.uid;
    if (!userId) return;
    
    try {
      const status = await CheckInService.getTodayStatus(userId);
      setTodayStatus(status);
      
      if (status.checkedIn && status.checkIn) {
        setFormData({
          mood: status.checkIn.mood,
          stress_management: status.checkIn.stress_management,
          energy: status.checkIn.energy,
          motivation: status.checkIn.motivation,
          confidence: status.checkIn.confidence ?? 5,
          sleep: status.checkIn.sleep,
          focus: status.checkIn.focus,
          recovery: status.checkIn.recovery ?? 5,
          trainingLoad: status.checkIn.trainingLoad,
          preCompetition: status.checkIn.preCompetition,
          note: status.checkIn.note || '',
        });
      }
    } catch (error) {
      console.error('Error checking today status:', error);
    }
  };

  const handleSliderChange = (field: keyof CheckInFormData) => (value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleTrainingLoadChange = (value: string) => {
    setFormData(prev => ({ ...prev, trainingLoad: value as CheckInFormData['trainingLoad'] }));
  };

  const handlePreCompetitionChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, preCompetition: value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 120) {
      setFormData(prev => ({ ...prev, note: value }));
    }
  };

  const validateFormData = (data: CheckInFormData): string[] => {
    const errors: string[] = [];
    
    // Validate numeric ranges
  const numericFields = ['mood', 'stress_management', 'energy', 'motivation', 'sleep', 'focus', 'confidence', 'recovery'] as const;
    numericFields.forEach(field => {
      const v = (data as any)[field];
      if (v !== undefined && v !== null) {
        if (typeof v !== 'number' || v < 1 || v > 10) {
          errors.push(`${field} must be between 1 and 10`);
        }
      }
    });
    
    // Validate training load
    const validTrainingLoads = ['none', 'light', 'moderate', 'hard'];
    if (!validTrainingLoads.includes(data.trainingLoad)) {
      errors.push('Invalid training load selection');
    }
    
    // Validate pre-competition
    if (typeof data.preCompetition !== 'boolean') {
      errors.push('Pre-competition must be true or false');
    }
    
    // Validate note length
    if (data.note && data.note.length > 120) {
      errors.push('Note must be 120 characters or less');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to check in.');
      return;
    }
    const userId = (user as any)?.id || (user as any)?.uid;
    if (!userId) {
      setError('Could not determine your user account. Please re-login.');
      return;
    }

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]); // Show first error
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (todayStatus?.checkedIn && todayStatus.checkIn && isEditing) {
        // Update existing check-in
        await CheckInService.updateCheckIn(userId, todayStatus.checkIn.id, formData);
      } else {
        // Create new check-in
        await CheckInService.saveCheckIn(userId, formData);
      }
      
      // Mark checkin task as complete
      localStorage.setItem('checkinCompleted', 'true');
      
      setShowSuccess(true);
      setIsEditing(false);
      
      // Refresh today status to show updated data
      await checkTodayStatus();
    } catch (error) {
      console.error('Error saving check-in:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          setError('Permission denied. Please check your login status.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(`Failed to save check-in: ${error.message}`);
        }
      } else {
        setError('Failed to save check-in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const averageScore = ((
    (formData.mood ?? 0) +
    (formData.stress_management ?? 0) +
    (formData.energy ?? 0) +
    (formData.motivation ?? 0) +
    (formData.confidence ?? 0) +
    (formData.sleep ?? 0) +
    (formData.focus ?? 0) +
    (formData.recovery ?? 0)
  ) / 8).toFixed(1);

  return (
    <Layout title="Check-in">
      <PageContainer
        title="Check-in"
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Daily <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Check-in</span></h1>}
        subtitle={todayStatus?.checkedIn && !isEditing ? 'You have already completed today\'s check-in.' : 'Track your mental and physical state in under a minute.'}
      >
          {!showSuccess && todayStatus?.checkedIn && !isEditing ? (
            // Already checked in - show summary
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <CheckSquare className="text-white" size={36} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black mb-4">
                  Performance <span className="text-green-500">Locked In!</span>
                </h1>
                <p className="text-xl text-gray-400">
                  Outstanding consistency building your mental edge.
                </p>
              </div>

      {todayStatus.checkIn && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-white mb-1">Today's Summary</h3>
        <p className="text-green-400 text-sm mb-3">Completed today — you can edit any time.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Mood</p>
                    <p className="text-white font-bold">{todayStatus.checkIn.mood}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Stress Management</p>
                    <p className="text-white font-bold">{todayStatus.checkIn.stress_management}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Energy</p>
                    <p className="text-white font-bold">{todayStatus.checkIn.energy}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Focus</p>
                    <p className="text-white font-bold">{todayStatus.checkIn.focus}/10</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Today</span>
              </button>
              <button
                onClick={() => router.push('/progress')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View Progress
              </button>
              <button
                onClick={() => router.push('/exercises')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Do Exercises
              </button>
            </div>
          </motion.div>
        ) : !showSuccess ? (
          // Check-in form
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core Metrics Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Core Metrics (Wellbeing)</h3>
                <div className="space-y-4">
                  <CustomSlider
                    label="Mood"
                    value={formData.mood}
                    onChange={handleSliderChange('mood')}
                    min={1}
                    max={10}
                    color="blue"
                  />
                  
                  <CustomSlider
                    label="Stress Management"
                    value={formData.stress_management}
                    onChange={handleSliderChange('stress_management')}
                    min={1}
                    max={10}
                    color="orange"
                  />
                  
                  <CustomSlider
                    label="Energy"
                    value={formData.energy}
                    onChange={handleSliderChange('energy')}
                    min={1}
                    max={10}
                    color="green"
                  />
                  
                  <CustomSlider
                    label="Motivation"
                    value={formData.motivation}
                    onChange={handleSliderChange('motivation')}
                    min={1}
                    max={10}
                    color="purple"
                  />

                  <CustomSlider
                    label="Confidence"
                    value={formData.confidence ?? 5}
                    onChange={handleSliderChange('confidence') as any}
                    min={1}
                    max={10}
                    color="blue"
                  />
                </div>
              </div>

              {/* Recovery & Performance Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recovery & Performance</h3>
                <div className="space-y-4">
                  <CustomSlider
                    label="Sleep Quality"
                    value={formData.sleep}
                    onChange={handleSliderChange('sleep')}
                    min={1}
                    max={10}
                    color="blue"
                  />
                  
                  
                  
                  <CustomSlider
                    label="Focus"
                    value={formData.focus}
                    onChange={handleSliderChange('focus')}
                    min={1}
                    max={10}
                    color="purple"
                  />

                  <CustomSlider
                    label="Recovery"
                    value={formData.recovery ?? 5}
                    onChange={handleSliderChange('recovery') as any}
                    min={1}
                    max={10}
                    color="green"
                  />

                  
                </div>
              </div>

              {/* Training & Context Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Training & Context</h3>
                <div className="space-y-4">
                  <SegmentedControl
                    label="Training Load Today"
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'light', label: 'Light' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'hard', label: 'Hard' }
                    ]}
                    value={formData.trainingLoad}
                    onChange={handleTrainingLoadChange}
                    color="red"
                  />
                  
                  <ToggleSwitch
                    label="Pre-Competition"
                    value={formData.preCompetition}
                    onChange={handlePreCompetitionChange}
                    description="Are you competing tomorrow or within the next few days?"
                    color="red"
                  />
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-lg font-medium text-gray-100 mb-3">
                  Journal Entry <span className="text-gray-400 text-sm">(optional, max 500 chars)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.note}
                    onChange={handleNotesChange}
                    placeholder="How are you feeling today? Any specific goals or challenges? Reflect on your mental state..."
                    className="w-full p-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none resize-none h-32"
                    disabled={loading}
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.note.length}/500
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-900 rounded-lg p-6 border border-red-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">{averageScore}/10</div>
                  <p className="text-gray-400 text-sm">Overall Wellness Score</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{isEditing ? 'Update Check-in' : 'Complete Check-in'}</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          // Success Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckSquare className="text-white" size={32} />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isEditing ? 'Check-in Updated!' : 'Check-in Complete!'}
              </h1>
              <p className="text-green-400 font-medium">You've completed today's check-in. You can edit it anytime today.</p>
              <p className="text-gray-400">
                Great job staying consistent with your mental wellness tracking.
              </p>
            </div>

            {/* Navigation Options */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => { setShowSuccess(false); setIsEditing(true); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Edit Today
              </button>
              <button
                onClick={() => router.push('/progress')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>View Progress</span>
              </button>
              <button
                onClick={() => router.push('/exercises')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Browse Exercises
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </PageContainer>
    </Layout>
  );
};

const CheckInPage: React.FC = () => {
  return (
    <ClientOnly>
      <RequireAuth>
        <CheckInPageContent />
      </RequireAuth>
    </ClientOnly>
  );
};

export default CheckInPage;
