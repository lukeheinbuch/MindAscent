import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, X } from 'lucide-react';
import { Badge, AVAILABLE_BADGES } from '@/services/gamification';
import Icon from './Icon';

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
  showAll?: boolean;
  className?: string;
}

interface BadgeModalProps {
  badge: Badge | (Omit<Badge, 'unlockedAt'> & { locked: true });
  isOpen: boolean;
  onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, isOpen, onClose }) => {
  if (!isOpen) return null;

  const isLocked = 'locked' in badge;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center ${
                isLocked ? 'grayscale opacity-50' : ''
              }`}>
                <Icon 
                  name={badge.icon} 
                  className={isLocked ? 'text-gray-400' : 'text-red-500'} 
                  size={24} 
                />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                  {badge.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  isLocked 
                    ? 'bg-gray-700 text-gray-400' 
                    : badge.category === 'streak' 
                      ? 'bg-red-600 text-white'
                      : badge.category === 'completion'
                        ? 'bg-blue-600 text-white'
                        : badge.category === 'xp'
                          ? 'bg-purple-600 text-white'
                          : 'bg-green-600 text-white'
                }`}>
                  {badge.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className={`text-sm mb-4 ${isLocked ? 'text-gray-400' : 'text-gray-300'}`}>
            {badge.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className={`w-4 h-4 ${isLocked ? 'text-gray-500' : 'text-yellow-500'}`} />
              <span className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-yellow-400'}`}>
                +{badge.xpReward} XP
              </span>
            </div>
            {!isLocked && 'unlockedAt' in badge && (
              <span className="text-xs text-gray-500">
                Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {isLocked && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-400">How to unlock:</span>
              </div>
              <p className="text-sm text-gray-500">{badge.description}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ unlockedBadges, showAll = false, className = '' }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | (Omit<Badge, 'unlockedAt'> & { locked: true }) | null>(null);
  
  const unlockedBadgeIds = unlockedBadges.map(b => b.id);
  const lockedBadges = AVAILABLE_BADGES.filter(b => !unlockedBadgeIds.includes(b.id))
    .map(b => ({ ...b, locked: true as const }));

  const displayBadges = showAll 
    ? [...unlockedBadges, ...lockedBadges]
    : unlockedBadges;

  const recentBadges = unlockedBadges
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  if (!showAll && unlockedBadges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800 rounded-lg p-6 border border-gray-700 text-center ${className}`}
      >
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Badges Yet</h3>
        <p className="text-gray-400 text-sm">
          Complete check-ins and exercises to start earning badges!
        </p>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {!showAll && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Badges</h3>
          <p className="text-sm text-gray-400">Your latest achievements</p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {displayBadges.map((badge, index) => {
          const isLocked = 'locked' in badge;
          
          return (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                isLocked
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-yellow-500/30 bg-yellow-900/20 hover:border-yellow-400 hover:bg-yellow-900/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2 ${
                isLocked ? 'grayscale opacity-50' : ''
              }`}>
                <Icon 
                  name={badge.icon} 
                  className={isLocked ? 'text-gray-400' : 'text-yellow-400'} 
                  size={20} 
                />
              </div>
              <h4 className={`text-xs font-medium ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                {badge.name}
              </h4>
              
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              )}

              {!isLocked && 'unlockedAt' in badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {!showAll && unlockedBadges.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            +{unlockedBadges.length - 3} more badges earned
          </p>
        </div>
      )}

      <BadgeModal
        badge={selectedBadge!}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
};

export default BadgeDisplay;
