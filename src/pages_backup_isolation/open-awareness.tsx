import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import OpenAwareness from '@/components/exercises/OpenAwareness';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';

const OpenAwarenessPage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      try { gamificationService.recordExerciseAccess(user.id, 'open-awareness'); } catch {}
    }
  }, [user]);

  return (
    <Layout title="Open Awareness" fullScreen>
      <OpenAwareness onExit={() => window.history.back()} />
    </Layout>
  );
};

export default OpenAwarenessPage;
