import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  titleNode?: ReactNode; // optional custom title rendering
  accent?: 'red-gradient' | 'none';
}

const gradientClass = 'bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(239,68,68,0.35)]';

const PageContainer: React.FC<PageContainerProps> = ({ title, subtitle, actions, children, titleNode, accent = 'none' }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {titleNode ? (
              titleNode
            ) : (
              <h1 className={`text-3xl font-bold tracking-tight ${accent === 'red-gradient' ? gradientClass : 'text-white'}`}>{title}</h1>
            )}
            {subtitle && <p className="text-gray-400 mt-1 text-sm md:text-base">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </motion.div>
      {children}
    </div>
  );
};

export default PageContainer;
