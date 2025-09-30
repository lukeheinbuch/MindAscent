import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Zap } from 'lucide-react';
import { UserStats } from '@/services/gamification';

interface XPDisplayProps {
  stats: UserStats;
  showDetailed?: boolean;
  className?: string;
}

const XPDisplay: React.FC<XPDisplayProps> = ({ stats, showDetailed = false, className = '' }) => {
  const progressPercentage = ((stats.currentLevelXP / (stats.nextLevelXP - (stats.totalXP - stats.currentLevelXP))) * 100);
  
  if (!showDetailed) {
    // Compact version for navigation or quick display
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-white">{stats.level}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-300">{stats.totalXP}</span>
        </div>
      </div>
    );
  }

  // Detailed version for profile or dedicated display
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
    >
      {/* Level and XP Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Level {stats.level}</h3>
            <p className="text-sm text-gray-400">Mental Athlete</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-semibold text-white">{stats.totalXP.toLocaleString()}</span>
            <span className="text-sm text-gray-400">XP</span>
          </div>
          <p className="text-xs text-gray-500">Total Experience</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Level Progress</span>
          <span className="text-sm text-gray-400">
            {stats.currentLevelXP} / {stats.nextLevelXP - (stats.totalXP - stats.currentLevelXP)} XP
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {stats.nextLevelXP - stats.currentLevelXP} XP until level {stats.level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-sm font-bold">{stats.currentStreak}</span>
          </div>
          <p className="text-xs text-gray-400">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-400">{stats.longestStreak} Days</p>
          <p className="text-xs text-gray-500">Best Streak</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-sm font-bold">{stats.badges.length}</span>
          </div>
          <p className="text-xs text-gray-400">Badges Earned</p>
        </div>
      </div>
    </motion.div>
  );
};

export default XPDisplay;
