import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Home,
  CheckSquare,
  BookOpen,
  Heart,
  User,
  Activity,
  TrendingUp,
  LogOut,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';

interface NavigationProps {
  mobile?: boolean;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Check-In', href: '/checkin', icon: CheckSquare },
  { name: 'Exercises', href: '/exercises', icon: Activity },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Education', href: '/education', icon: BookOpen },
  { name: 'Resources', href: '/resources', icon: Heart },
  { name: 'Profile', href: '/profile', icon: User },
];

const Navigation: React.FC<NavigationProps> = ({ mobile = false }) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { success, error } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      success('Signed out', 'You have been signed out.');
      router.replace('/');
    } catch (e: any) {
      console.error('Sign out failed:', e);
      error('Sign out failed', e?.message || 'Please try again.');
    }
  };

  if (mobile) {
    return (
      <nav className="px-3 py-2">
        <div className="grid grid-cols-8 gap-x-2 gap-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`col-span-2 ${index === 4 ? 'col-start-2' : ''}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-red-400 bg-gray-800/70'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[11px] mt-1 leading-none">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="h-full flex flex-col p-4">
      {/* Brand */}
      <div className="mb-4">
        <Link href="/dashboard" className="group inline-flex items-center relative select-none">
          <span className="relative mr-2">
            <span className="absolute inset-0 rounded-full bg-red-600/20 blur-md opacity-70 group-hover:opacity-90 transition-opacity" />
            <Brain className="relative text-red-500" size={22} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Mind
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(239,68,68,0.35)]">Ascent</span>
          </span>
          <span className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-red-600 via-rose-500 to-transparent" />
        </Link>
      </div>

      <div className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_6px_24px_-4px_rgba(239,68,68,0.6)]' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent" />
                <Icon size={20} />
                <span className="font-medium relative z-10">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

  {/* Sign Out Button */}
  <div className="pt-4 border-t border-red-500/20">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
      onClick={handleSignOut}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-300 w-full relative overflow-hidden group hover:bg-gray-800/40"
        >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent" />
          <LogOut size={20} />
      <span className="font-medium relative z-10">Sign Out</span>
        </motion.button>
  </div>
    </nav>
  );
};

export default Navigation;
