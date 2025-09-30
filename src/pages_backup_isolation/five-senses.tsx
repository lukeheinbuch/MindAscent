import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import FiveSensesAwareness from '@/components/exercises/FiveSensesAwareness';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';

const FiveSensesPage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      try { gamificationService.recordExerciseAccess(user.id, 'five-senses-awareness'); } catch {}
    }
  }, [user]);

  return (
    <Layout title="Five Senses Awareness" fullScreen>
      <FiveSensesAwareness onExit={() => window.history.back()} />
    </Layout>
  );
};

export default FiveSensesPage;
