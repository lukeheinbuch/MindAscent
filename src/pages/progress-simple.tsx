'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { RequireAuth } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { TrendingUp, BarChart3, Target, Trophy, Calendar, Activity } from 'lucide-react';

const ProgressPageContent: React.FC = () => {
  return (
    <Layout title="Progress">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Progress Tracking
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your mental wellness journey visualization will be available soon. Start tracking your progress today.
          </p>
        </motion.div>

        {/* Preview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Weekly Analytics</h3>
            <p className="text-gray-400 text-sm">Detailed insights into your check-ins, mood patterns, and exercise completion rates.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Goal Tracking</h3>
            <p className="text-gray-400 text-sm">Set and monitor your mental health goals with personalized milestones and achievements.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600/20 rounded-xl">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Achievements</h3>
            <p className="text-gray-400 text-sm">Unlock badges and rewards as you consistently engage with your mental wellness routine.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Streak Calendar</h3>
            <p className="text-gray-400 text-sm">Visual calendar showing your consistency and streak patterns over time.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <Activity className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mood Trends</h3>
            <p className="text-gray-400 text-sm">Track emotional patterns and identify triggers to optimize your mental health journey.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Performance Metrics</h3>
            <p className="text-gray-400 text-sm">Advanced analytics on your mental training progress and exercise effectiveness.</p>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-600/30 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Tracking?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Begin your journey today by completing your first check-in. The more consistent you are, the better insights you'll get about your mental wellness.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/checkin'}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25"
          >
            Complete First Check-in
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

const ProgressPage: React.FC = () => {
  return (
    <ClientOnly>
      <RequireAuth>
        <ProgressPageContent />
      </RequireAuth>
    </ClientOnly>
  );
};

export default ProgressPage;
