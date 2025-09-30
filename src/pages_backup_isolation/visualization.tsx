import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import Visualization from '@/components/exercises/Visualization';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';

const VisualizationPage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      try { gamificationService.recordExerciseAccess(user.id, 'visualization'); } catch {}
    }
  }, [user]);

  return (
    <Layout title="Visualization" fullScreen>
      <Visualization onExit={() => window.history.back()} />
    </Layout>
  );
};

export default VisualizationPage;
