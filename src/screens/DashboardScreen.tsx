import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Calendar, Target, Trophy, Activity, TrendingUp, CheckSquare, Book, Heart, Clock, CheckCircle, Smile, Meh, Frown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInService } from '@/services/checkIn';
import { CheckInData, StreakData } from '@/types';
import { formatDisplayDate, getStreakMessage, getMoodIcon, getMoodEmoji } from '@/utils';
import Loading from '@/components/Loading';
import Icon from '@/components/Icon';

interface DashboardScreenProps {
  onNavigate?: (path: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const displayName = (user?.user_metadata?.username as string) || user?.email || 'Athlete';
  
  const [todaysCheckIn, setTodaysCheckIn] = useState<CheckInData | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInData[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      if (onNavigate) {
        onNavigate('/login');
      } else {
        router.push('/login');
      }
      return;
    }

    loadDashboardData();
  }, [user, authLoading, router, onNavigate]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's check-in
      const todayCheckIn = await CheckInService.getCheckIn(user.uid, today);
      setTodaysCheckIn(todayCheckIn);
      
      // Load recent check-ins
      const recent = await CheckInService.getRecentCheckIns(user.uid, 7);
      setRecentCheckIns(recent);
      
      // Load streak data
      const streak = await CheckInService.getStreakData(user.uid);
      setStreakData(streak);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
  <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}!</h1>
        <p className="text-gray-400">
          Ready to strengthen your mental game today?
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        {/* Current Streak */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              {streakData?.currentStreak || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Current Streak</h3>
          <p className="text-gray-400 text-sm">
            {streakData ? getStreakMessage(streakData.currentStreak) : 'Start your journey!'}
          </p>
        </div>

        {/* Today's Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${todaysCheckIn ? 'bg-green-600' : 'bg-yellow-600'}`}>
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center">
              {todaysCheckIn ? (
                <Icon name="check-circle" className="w-8 h-8 text-green-400" />
              ) : (
                <Icon name="clock" className="w-8 h-8 text-yellow-400" />
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Today's Check-in</h3>
          <p className="text-gray-400 text-sm">
            {todaysCheckIn ? 'Completed!' : 'Pending'}
          </p>
        </div>

        {/* Total Check-ins */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              {streakData?.totalCheckIns || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Total Check-ins</h3>
          <p className="text-gray-400 text-sm">Keep building momentum</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Action */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Today's Focus</h2>
          
          {!todaysCheckIn ? (
            <div className="text-center py-8">
              <CheckSquare className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ready for your check-in?</h3>
              <p className="text-gray-400 mb-6">
                Take a moment to assess your mental state and track your progress.
              </p>
              <button
                onClick={() => handleNavigation('/checkin')}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Start Check-in
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Mood</span>
                <div className="flex items-center space-x-2">
                  <Icon name={getMoodIcon(todaysCheckIn.mood)} className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-medium">{todaysCheckIn.mood}/5</span>
                </div>
              </div>
              
              <div className="text-center py-4">
                <Icon name="check-circle" className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium mb-2">Check-in Complete!</p>
                <p className="text-gray-400 text-sm">
                  Great job staying consistent with your mental training.
                </p>
              </div>

              <button
                onClick={() => handleNavigation('/exercises')}
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                View Suggested Exercises
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Progress</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.slice(0, 5).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {formatDisplayDate(new Date(checkIn.date))}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Avg: {((checkIn.mood + checkIn.stress_management + checkIn.energy + checkIn.motivation) / 4).toFixed(1)}/10
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Icon name={getMoodIcon(checkIn.mood)} className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                No check-ins yet. Complete your first one to start tracking progress!
              </p>
            )}
          </div>

          {recentCheckIns.length > 0 && (
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full mt-4 text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              View full history →
            </button>
          )}
        </motion.div>
      </div>

      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-3 gap-6 mt-8"
      >
        <button
          onClick={() => handleNavigation('/exercises')}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors text-left group"
        >
          <Activity className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Mental Exercises</h3>
          <p className="text-gray-400 text-sm">Breathing, visualization, and mindfulness exercises</p>
        </button>

        <button
          onClick={() => handleNavigation('/education')}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors text-left group"
        >
          <Book className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Education Hub</h3>
          <p className="text-gray-400 text-sm">Learn about sports psychology and mental training</p>
        </button>

        <button
          onClick={() => handleNavigation('/resources')}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors text-left group"
        >
          <Heart className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Resource Center</h3>
          <p className="text-gray-400 text-sm">Crisis support, professionals, and helpful resources</p>
        </button>
      </motion.div>
    </div>
  );
};

export default DashboardScreen;
