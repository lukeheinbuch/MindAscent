import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import GratitudeJournal from '@/components/exercises/GratitudeJournal';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';

const GratitudePage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      try {
        gamificationService.recordExerciseAccess(user.id, 'gratitude-journal');
      } catch {}
    }
  }, [user]);

  return (
    <Layout title="Gratitude Journal" fullScreen>
      <GratitudeJournal onExit={() => window.history.back()} />
    </Layout>
  );
};

export default GratitudePage;
