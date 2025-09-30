import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { User, Settings, Trophy, Target, TrendingUp, LogOut, Edit3, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  
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

  if (authLoading || loading) {
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
                  {user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-400">{user?.email}</p>
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

          {/* Stats Cards */}
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

          {/* Get Started Section */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Welcome to MindAscent!
            </h2>
            <p className="text-gray-400 mb-6">
              Start your wellness journey by completing your first check-in to unlock your full profile.
            </p>
            <button
              onClick={() => router.push('/checkin')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Complete First Check-in
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
