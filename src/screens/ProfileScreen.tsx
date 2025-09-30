import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { User, Settings, Trophy, Target, TrendingUp, LogOut, Edit3, Calendar, Award, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInService } from '@/services/checkIn';
import { StreakData, CheckInData } from '@/types';
import { formatDisplayDate, getStreakMessage, getMoodEmoji } from '@/utils';

interface ProfileScreenProps {
  onNavigate?: (path: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const displayName = (user?.user_metadata?.username as string) || user?.email || 'Athlete';
  
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [totalCheckIns, setTotalCheckIns] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<CheckInData[]>([]);
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

    loadProfileData();
  }, [user, authLoading, router, onNavigate]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load streak data
      const streak = await CheckInService.getStreakData(user.uid);
      setStreakData(streak);
      
      // Load recent check-ins for activity feed
      const recent = await CheckInService.getRecentCheckIns(user.uid, 10);
      setRecentActivity(recent);
      
      // Set total check-ins from streak data
      if (streak) {
        setTotalCheckIns(streak.totalCheckIns);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onNavigate) {
        onNavigate('/login');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const getAverageScore = (checkIns: CheckInData[]) => {
    if (checkIns.length === 0) return 0;
    const total = checkIns.reduce((sum, checkIn) => {
      return sum + checkIn.mood + checkIn.stress_management + checkIn.energy + checkIn.motivation;
    }, 0);
    return Math.round((total / (checkIns.length * 4)) * 10) / 10;
  };

  const getStreakBadges = (currentStreak: number, longestStreak: number) => {
    const badges = [];
    
    // Current streak badges
    if (currentStreak >= 3) badges.push({ name: '3-Day Streak', icon: 'flame', color: 'bg-orange-600' });
    if (currentStreak >= 7) badges.push({ name: 'Week Warrior', icon: 'zap', color: 'bg-yellow-600' });
    if (currentStreak >= 30) badges.push({ name: 'Month Master', icon: 'trophy', color: 'bg-purple-600' });
    if (currentStreak >= 100) badges.push({ name: 'Century Club', icon: 'gem', color: 'bg-blue-600' });
    
    // Milestone badges
    if (longestStreak >= 7) badges.push({ name: 'Consistency', icon: 'target', color: 'bg-green-600' });
    if (longestStreak >= 30) badges.push({ name: 'Dedication', icon: 'star', color: 'bg-indigo-600' });
    
    return badges.slice(0, 6); // Show max 6 badges
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const badges = getStreakBadges(streakData?.currentStreak || 0, streakData?.longestStreak || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              {streakData && streakData.currentStreak > 0 && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
              <p className="text-gray-400 mb-1">{user?.email || ''}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{streakData?.currentStreak || 0}</p>
                  <p className="text-xs text-gray-400">Current Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{streakData?.longestStreak || 0}</p>
                  <p className="text-xs text-gray-400">Best Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{totalCheckIns}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors">
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats and Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Achievement Badges */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold text-white">Achievements</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${badge.color} rounded-lg p-4 text-center text-white`}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 7).map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getMoodEmoji(checkIn.mood)}</div>
                      <div>
                        <p className="text-white font-medium">
                          {formatDisplayDate(new Date(checkIn.date))}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Average: {((checkIn.mood + checkIn.stress_management + checkIn.energy + checkIn.motivation) / 4).toFixed(1)}/10.0
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          checkIn.mood >= 4 ? 'bg-green-500' : checkIn.mood >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        title={`Mood: ${checkIn.mood}`}
                      ></div>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          checkIn.stress_management >= 7 ? 'bg-green-500' : checkIn.stress_management >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        title={`Stress Management: ${checkIn.stress_management}`}
                      ></div>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          checkIn.energy >= 4 ? 'bg-green-500' : checkIn.energy >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        title={`Energy: ${checkIn.energy}`}
                      ></div>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          checkIn.motivation >= 4 ? 'bg-green-500' : checkIn.motivation >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        title={`Motivation: ${checkIn.motivation}`}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No check-ins yet</p>
                  <button
                    onClick={() => handleNavigation('/checkin')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Complete Your First Check-in
                  </button>
                </div>
              )}
            </div>

            {recentActivity.length > 0 && (
              <button
                onClick={() => handleNavigation('/checkin')}
                className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Complete Today's Check-in
              </button>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Quick Stats</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Streak</span>
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-white font-semibold">{streakData?.currentStreak || 0} days</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Best Streak</span>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-white font-semibold">{streakData?.longestStreak || 0} days</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Average Score</span>
                <span className="text-white font-semibold">{getAverageScore(recentActivity)}/5.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Check-ins</span>
                <span className="text-white font-semibold">{totalCheckIns}</span>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Account</h2>

            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-white font-medium">Settings</p>
                  <p className="text-gray-400 text-sm">Manage preferences</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors">
                <Award className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-white font-medium">Achievements</p>
                  <p className="text-gray-400 text-sm">View all badges</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-left hover:bg-red-900/50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">Sign Out</p>
                  <p className="text-gray-400 text-sm">Sign out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
