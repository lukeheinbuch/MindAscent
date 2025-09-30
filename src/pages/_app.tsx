import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-inter', display: 'swap' });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className={inter.variable}>
            <Component {...pageProps} />
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}
