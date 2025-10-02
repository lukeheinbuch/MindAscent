import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { User, Trophy, Target, TrendingUp, LogOut } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading || loading || profileLoading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.username || profile?.display_name || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-400">@{profile?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Stats Cards (basic placeholders; real values shown on dashboard) */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Level</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">1</p>
              <p className="text-sm text-gray-400">Keep checking in to level up!</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Streak</h3>
                <Target className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-gray-400">Days in a row</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Total XP</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-gray-400">Experience points earned</p>
            </div>
          </div>

          {/* Athlete Profile */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Athlete Profile</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-200">
              <div>
                <p className="text-sm text-gray-400">Sport</p>
                <p className="text-lg">{profile?.sport || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-lg">{profile?.level || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Age</p>
                <p className="text-lg">{typeof profile?.age === 'number' ? profile?.age : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Country</p>
                <p className="text-lg">{profile?.country || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400">Goals</p>
                <p className="text-lg">{Array.isArray(profile?.goals) ? (profile?.goals as any[]).join(', ') : (profile?.goals || '—')}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400">About</p>
                <p className="text-lg whitespace-pre-wrap">{profile?.about || '—'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
