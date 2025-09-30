import React from 'react';
import Layout from '@/components/Layout';
import ProgressiveMuscleRelaxation from '@/components/exercises/ProgressiveMuscleRelaxation';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const PMRPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    if (user?.id) {
      try { await gamificationService.updateExerciseCompletion(user.id, 'progressive-muscle-relaxation'); } catch {}
    }
  };

  return (
    <Layout title="Progressive Muscle Relaxation" fullScreen>
      <ProgressiveMuscleRelaxation
        onExit={() => router.push('/exercises')}
        onComplete={handleComplete}
      />
    </Layout>
  );
};

export default PMRPage;
