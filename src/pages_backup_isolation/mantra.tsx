import React from 'react';
import { useRouter } from 'next/router';
import MantraMeditation from '@/components/exercises/MantraMeditation';

const MantraPage: React.FC = () => {
  const router = useRouter();
  return (
    <MantraMeditation
      onExit={() => router.push('/exercises')}
    />
  );
};

export default MantraPage;
