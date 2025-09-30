import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationService } from '@/services/gamification';
import BoxBreathing from '@/components/exercises/BoxBreathing';

const BoxBreathingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleComplete = async () => {
    if (!user) return;

    try {
      await gamificationService.updateExerciseCompletion(user.uid, 'box-breathing');
    } catch (error) {
      console.error('Error tracking exercise completion:', error);
    }
  };

  const handleExit = () => {
    router.push('/exercises');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <BoxBreathing
      onComplete={handleComplete}
      onExit={handleExit}
      totalCycles={4}
      phaseDuration={4000}
    />
  );
};

export default BoxBreathingPage;
