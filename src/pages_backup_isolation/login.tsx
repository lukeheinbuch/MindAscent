import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { RequireGuest } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { useToast } from '@/components/Toast';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const LoginPageContent: React.FC = () => {
  const router = useRouter();
  const { signIn, error, clearError } = useAuth();
  const { success, error: showErrorToast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    // Clear any prior auth error when arriving on login page
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear global auth error when user types
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || loading) return;

    setLoading(true);
    setErrors({});
    
    try {
      const { session } = await signIn(formData.email, formData.password);
      if (!session) {
        showErrorToast('Login Failed', 'Invalid credentials or no session created.');
        setLoading(false);
        return;
      }
      success('Welcome back!', 'You have been successfully logged in.');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justSignedIn', '1');
        setTimeout(() => sessionStorage.removeItem('justSignedIn'), 3000);
      }
      // Let AuthContext onAuthStateChange propagate first
      await Promise.resolve();
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Show error toast for better UX
      if (err.code || error) {
        showErrorToast('Login Failed', error || 'Please check your credentials and try again.');
      } else {
        showErrorToast('Login Failed', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your mental wellness journey</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-900 p-8 rounded-2xl space-y-6"
        >
          {errors.general && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-red-600'
                }`}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-red-600'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => {
                // TODO: Implement forgot password functionality
                showErrorToast('Forgot password feature coming soon! Please contact support for password reset.');
              }}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Don't have account */}
          <div className="text-center pt-4">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </motion.form>

        {/* Demo Account Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-300 mb-2">New to MindAscent?</h3>
          <p className="text-xs text-gray-400 mb-3">
            Create your account to start tracking your mental wellness journey with personalized insights and recommendations.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded transition-colors"
          >
            Get Started Free
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  return (
    <ClientOnly>
      <RequireGuest>
        <LoginPageContent />
      </RequireGuest>
    </ClientOnly>
  );
};

export default LoginPage;
