import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

export const AuthDebugInfo: React.FC = () => {
  const { user, session, loading, error } = useAuth();
  const router = useRouter();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 p-3 rounded-lg text-xs text-white max-w-xs z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Route: {router.pathname}</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
  <div>User: {user ? `${user.email ?? user.id}` : 'null'}</div>
  <div>Session: {session ? 'active' : 'null'}</div>
      {error && <div className="text-red-400">Error: {error}</div>}
    </div>
  );
};
