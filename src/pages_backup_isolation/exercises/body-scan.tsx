import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationService } from '@/services/gamification';
import BodyScan from '@/components/exercises/BodyScan';

const BodyScanPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await gamificationService.updateExerciseCompletion(user.uid || user.id, 'body-scan');
    } catch (e) {
      console.error('Error tracking completion:', e);
    }
  };

  const handleExit = () => router.push('/exercises');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <BodyScan onComplete={handleComplete} onExit={handleExit} autoAdvanceInterval={60000} includeIntro />;
};

export default BodyScanPage;
