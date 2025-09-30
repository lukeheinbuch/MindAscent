import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import Navigation from './Navigation';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean; // hides standard layout chrome for immersive exercises
}

const Layout: React.FC<LayoutProps> = ({ title, children, fullScreen = false }) => {
  return (
    <div className="min-h-screen w-full bg-black text-white flex">
      <Head>
        <title>{title ? `${title} | MindAscent` : 'MindAscent'}</title>
      </Head>
      {!fullScreen && (
        <aside className="hidden md:block w-64 bg-zinc-950 border-r border-red-500/10">
          <Navigation />
        </aside>
      )}
      <main className={fullScreen ? 'flex-1 w-full' : 'flex-1 px-4 md:px-8 py-6'}>
        {!fullScreen && (
          <div className="md:hidden -mx-4 mb-4">
            <div className="px-4 py-3 border-b border-gray-800 bg-black/80 supports-[backdrop-filter]:bg-black/60 backdrop-blur">
              <Link href="/dashboard" className="group inline-flex items-center select-none">
                <span className="relative mr-2">
                  <span className="absolute inset-0 rounded-full bg-red-600/20 blur-md opacity-70 group-hover:opacity-90 transition-opacity" />
                  <Brain className="relative text-red-500" size={22} />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  Mind
                  <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(239,68,68,0.35)]">Ascent</span>
                </span>
              </Link>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
