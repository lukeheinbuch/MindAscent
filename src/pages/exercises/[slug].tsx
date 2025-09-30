import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import Loading from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { exercisesData } from '@/data/placeholderData';
import { formatDuration, capitalize } from '@/utils';

const ExerciseDetailPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [user, loading, router]);

  const exercise = useMemo(() => exercisesData.find(e => e.id === slug), [slug]);

  if (loading || !slug) {
    return (
      <Layout title="Exercise">
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading exercise..." />
        </div>
      </Layout>
    );
  }

  if (!exercise) {
    return (
      <Layout title="Exercise Not Found">
        <PageContainer title="Exercise Not Found" subtitle="Please return to the list and choose a valid exercise.">
          <div className="text-gray-400">
            We couldn't find an exercise for “{slug}”.
            <div className="mt-4">
              <button onClick={() => router.push('/exercises')} className="btn-primary">Back to Exercises</button>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout title={exercise.title}>
      <PageContainer
        title={exercise.title}
        subtitle={exercise.description}
      >
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span>Category: <span className="text-primary-400">{capitalize(exercise.category.replace('-', ' '))}</span></span>
            <span>Duration: <span className="text-primary-400">{formatDuration(exercise.duration)}</span></span>
            <span>Difficulty: <span className="text-primary-400 capitalize">{exercise.difficulty}</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              {exercise.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Benefits</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {exercise.benefits.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => router.push('/exercises')} className="btn-primary">Back</button>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default ExerciseDetailPage;
