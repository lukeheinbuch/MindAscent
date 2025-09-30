import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInService } from '@/services/checkIn';

const QuickCheckInButton: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkTodaysCheckIn();
  }, [user]);

  useEffect(() => {
    // Hide on certain pages
    const hiddenPages = ['/checkin', '/login', '/signup'];
    setIsVisible(!hiddenPages.includes(router.pathname));
  }, [router.pathname]);

  const checkTodaysCheckIn = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await CheckInService.getCheckIn(user.uid, today);
      setHasCheckedInToday(!!existing);
    } catch (error) {
      console.error('Error checking today\'s check-in:', error);
    }
  };

  const handleClick = () => {
    router.push('/checkin');
  };

  if (!user || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-200 ${
          hasCheckedInToday
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
        title={hasCheckedInToday ? 'Update today\'s check-in' : 'Complete daily check-in'}
      >
        <motion.div
          animate={hasCheckedInToday ? { rotate: 0 } : { rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: hasCheckedInToday ? 0 : Infinity, repeatDelay: 3 }}
        >
          <CheckSquare className="w-6 h-6 text-white" />
        </motion.div>
        
        {/* Pulse animation for incomplete check-ins */}
        {!hasCheckedInToday && (
          <motion.div
            className="absolute inset-0 bg-red-600 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </AnimatePresence>
  );
};

export default QuickCheckInButton;
