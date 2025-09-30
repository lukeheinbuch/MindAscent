import React from 'react';
import Layout from '@/components/Layout';
import PostPerformanceReflection from '@/components/exercises/PostPerformanceReflection';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const ReflectionPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    if (user?.id) {
      try { await gamificationService.updateExerciseCompletion(user.id, 'post-performance-reflection'); } catch {}
    }
  };

  return (
    <Layout title="Post-Performance Reflection" fullScreen>
      <PostPerformanceReflection
        onExit={() => router.push('/exercises')}
        onComplete={handleComplete}
      />
    </Layout>
  );
};

export default ReflectionPage;
