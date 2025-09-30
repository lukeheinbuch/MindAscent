import React from 'react';
import {
  Star,
  Flame,
  Trophy,
  Crown,
  Zap,
  Clock,
  CheckCircle,
  Book,
  Award,
  Rocket,
  Heart,
  Battery,
  Target,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const IconMap = {
  // Badge icons
  star: Star,
  flame: Flame,
  trophy: Trophy,
  crown: Crown,
  zap: Zap,
  book: Book,
  award: Award,
  rocket: Rocket,
  
  // Mood icons
  heart: Heart,
  battery: Battery,
  target: Target,
  smile: Smile,
  frown: Frown,
  meh: Meh,
  clock: Clock,
  'check-circle': CheckCircle,
  'battery-low': Battery,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
};

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  const IconComponent = IconMap[name as keyof typeof IconMap];
  
  if (!IconComponent) {
    // Fallback to Star if icon not found
    return <Star className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default Icon;
