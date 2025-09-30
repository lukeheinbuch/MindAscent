import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

// Legacy route: immediately redirect to the actual login page
const LegacyLoginRedirect: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return null;
};

export default LegacyLoginRedirect;
