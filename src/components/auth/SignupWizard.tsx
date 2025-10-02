import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock,
  Trophy,
  Target,
  Calendar,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { 
  GoalTag, 
  SportLevel, 
  SPORTS_OPTIONS, 
  GOALS_OPTIONS, 
  SPORT_LEVELS 
} from '@/types/user';
import { validateEmail, validatePassword, getPasswordStrength } from '@/utils';
import Loading from '@/components/Loading';

interface Step1Data {
  username: string;
  email: string;
  password: string;
}

interface Step2Data {
  sport: string;
  level: SportLevel | '';
  age: number | '';
  country: string;
}

interface Step3Data {
  goals: GoalTag[];
  about: string;
}

interface FormErrors {
  [key: string]: string;
}

const SignupWizard: React.FC = () => {
  const router = useRouter();
  const { user, signUp } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Form data for each step
  const [step1Data, setStep1Data] = useState<Step1Data>({
    username: '',
    email: '',
    password: ''
  });
  
  const [step2Data, setStep2Data] = useState<Step2Data>({
    sport: '',
    level: '',
    age: '',
    country: ''
  });
  
  const [step3Data, setStep3Data] = useState<Step3Data>({
    goals: [],
    about: '',
    
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [confirmationPending, setConfirmationPending] = useState<string | null>(null);

  // Simple username availability check (placeholder). In production, check against your DB.
  const isUsernameAvailable = async (username: string): Promise<boolean> => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return false;
    try {
      const res = await fetch('/api/supabase/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) return true; // be lenient on transient errors
      const json = await res.json();
      return !!json.available;
    } catch (e) {
      console.warn('username availability check failed', e);
      return true; // lenient fallback
    }
  };

  // Do not auto-redirect here; RequireGuest will handle redirect

  // Username availability check with debounce
  React.useEffect(() => {
    if (!step1Data.username || step1Data.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(step1Data.username)) {
      setUsernameAvailable(null);
      return;
    }

  const timeoutId = setTimeout(async () => {
      setUsernameChecking(true);
      try {
    const available = await isUsernameAvailable(step1Data.username);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [step1Data.username]);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!step1Data.username) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(step1Data.username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }

    if (!step1Data.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(step1Data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!step1Data.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(step1Data.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least 1 letter and 1 number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!step2Data.sport) {
      newErrors.sport = 'Please select your primary sport';
    }

    if (!step2Data.level) {
      newErrors.level = 'Please select your level';
    }

    if (!step2Data.age) {
      newErrors.age = 'Age is required';
    } else if (Number(step2Data.age) < 13) {
      newErrors.age = 'You must be at least 13 years old';
    } else if (Number(step2Data.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (step3Data.goals.length === 0) {
      newErrors.goals = 'Please select at least one goal';
    } else if (step3Data.goals.length > 5) {
      newErrors.goals = 'Please select no more than 5 goals';
    }

    if (step3Data.about && step3Data.about.length > 140) {
      newErrors.about = 'About section must be 140 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleGoalToggle = (goal: GoalTag) => {
    const currentGoals = step3Data.goals;
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    if (newGoals.length <= 5) {
      setStep3Data(prev => ({ ...prev, goals: newGoals }));
      clearFieldError('goals');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3() || loading) return;

    setLoading(true);
    setGeneralError('');

    try {
      // Sign up with Supabase; session will be null if email confirmation is required
      const collected = {
        email: step1Data.email,
        display_name: step1Data.username,
        username: step1Data.username,
        sport: step2Data.sport,
        level: step2Data.level || undefined,
        age: typeof step2Data.age === 'number' ? step2Data.age : undefined,
        country: step2Data.country || undefined,
        goals: step3Data.goals && step3Data.goals.length ? step3Data.goals : undefined,
        about: step3Data.about || undefined,
      };
      const { session } = await signUp(step1Data.email, step1Data.password, collected);

      if (!session) {
        // Email confirmation required: stash pending profile for after login
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('pendingProfile', JSON.stringify(collected));
          } catch (e) {
            console.warn('Failed to save pendingProfile to localStorage', e);
          }
        }
        setConfirmationPending(step1Data.email);
        return; // stop here; user must confirm via email
      }

      // If session exists, upsert profile immediately then redirect
      try {
        const resp = await fetch('/api/supabase/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collected),
        });
        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          if (resp.status === 409) {
            setGeneralError(errJson?.error || 'That username is already taken. Please choose another.');
            return; // stop, let user change username
          }
          setGeneralError(errJson?.error || 'Failed to save your profile. Please try again.');
          return;
        }
      } catch (e) {
        console.warn('ensure-profile failed after signup', e);
      }
      router.replace('/dashboard');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setGeneralError(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(step1Data.password);

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Back to Home */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
        {confirmationPending && (
          <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg text-amber-300">
            Please check {confirmationPending} to confirm your email. After confirming, return to the app and log in.
          </div>
        )}
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-neutral-400">Step {currentStep} of 3</span>
            <span className="text-sm text-neutral-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <motion.div
              className="bg-red-600 h-2 rounded-full"
              initial={{ width: "33%" }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 rounded-2xl shadow-xl px-6 py-8"
        >
          {/* Error message */}
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-400 text-sm">{generalError}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Account */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                  <p className="text-neutral-400">Let's start with the basics</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                      type="text"
                      value={step1Data.username}
                      onChange={(e) => {
                        setStep1Data(prev => ({ ...prev, username: e.target.value }));
                        clearFieldError('username');
                        setUsernameAvailable(null);
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all ${
                        errors.username ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
                      }`}
                      placeholder="Choose a username"
                      autoComplete="username"
                      inputMode="text"
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-600 border-t-red-600" />
                      </div>
                    )}
                    {!usernameChecking && usernameAvailable === true && step1Data.username.length >= 3 && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                  )}
                  {!errors.username && usernameAvailable === false && (
                    <p className="text-red-400 text-sm mt-1">Username is already taken</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                      type="email"
                      value={step1Data.email}
                      onChange={(e) => {
                        setStep1Data(prev => ({ ...prev, email: e.target.value }));
                        clearFieldError('email');
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all ${
                        errors.email ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
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
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={step1Data.password}
                      onChange={(e) => {
                        setStep1Data(prev => ({ ...prev, password: e.target.value }));
                        clearFieldError('password');
                      }}
                      className={`w-full pl-10 pr-12 py-3 bg-neutral-900 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all ${
                        errors.password ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
                      }`}
                      placeholder="Choose a strong password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {step1Data.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              passwordStrength === 'weak' ? 'bg-red-500 w-1/3' :
                              passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                              'bg-green-500 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-sm ${
                          passwordStrength === 'weak' ? 'text-red-500' :
                          passwordStrength === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                  <button
                    onClick={handleNext}
                    disabled={!step1Data.username || !step1Data.email || !step1Data.password || usernameChecking || usernameAvailable === false}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                  
                  <div className="text-center">
                    <p className="text-neutral-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => router.push('/login')}
                        className="text-red-600 hover:text-red-500 font-medium"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile Essentials */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Profile Essentials</h2>
                  <p className="text-neutral-400">MindAscent is for athletes of all levels. Tell us about you.</p>
                </div>

                {/* Primary Sport */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Primary Sport *
                  </label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <select
                      value={step2Data.sport}
                      onChange={(e) => {
                        setStep2Data(prev => ({ ...prev, sport: e.target.value }));
                        clearFieldError('sport');
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border rounded-xl text-white focus:outline-none focus:ring-4 transition-all ${
                        errors.sport ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
                      }`}
                    >
                      <option value="">Select your sport</option>
                      {SPORTS_OPTIONS.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>
                  {errors.sport && (
                    <p className="text-red-400 text-sm mt-1">{errors.sport}</p>
                  )}
                </div>

        {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
          Level *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPORT_LEVELS.map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setStep2Data(prev => ({ ...prev, level }));
                          clearFieldError('level');
                        }}
                        className={`px-4 py-3 rounded-xl border transition-colors text-sm ${
                          step2Data.level === level
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  {errors.level && (
                    <p className="text-red-400 text-sm mt-1">{errors.level}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Age *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                      type="number"
                      value={step2Data.age}
                      onChange={(e) => {
                        setStep2Data(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : '' }));
                        clearFieldError('age');
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all ${
                        errors.age ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
                      }`}
                      placeholder="Your age"
                      min="13"
                      max="120"
                    />
                  </div>
                  {errors.age && (
                    <p className="text-red-400 text-sm mt-1">{errors.age}</p>
                  )}
                </div>

                {/* Country (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Country/Region
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                      type="text"
                      value={step2Data.country}
                      onChange={(e) => setStep2Data(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all"
                      placeholder="United States"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!step2Data.sport || !step2Data.level || !step2Data.age}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals & Preferences */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Goals & Preferences</h2>
                  <p className="text-neutral-400">What do you want to focus on?</p>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Mental Training Goals * (Select 1-5)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS_OPTIONS.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalToggle(goal)}
                        className={`px-4 py-3 rounded-xl border transition-colors text-sm ${
                          step3Data.goals.includes(goal)
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        <Target className="w-4 h-4 inline mr-2" />
                        {goal}
                      </button>
                    ))}
                  </div>
                  {errors.goals && (
                    <p className="text-red-400 text-sm mt-1">{errors.goals}</p>
                  )}
                  <p className="text-neutral-500 text-xs mt-1">
                    Selected: {step3Data.goals.length}/5
                  </p>
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    About Me ({step3Data.about.length}/140)
                  </label>
                  <textarea
                    value={step3Data.about}
                    onChange={(e) => {
                      if (e.target.value.length <= 140) {
                        setStep3Data(prev => ({ ...prev, about: e.target.value }));
                        clearFieldError('about');
                      }
                    }}
                    className={`w-full px-4 py-3 bg-neutral-900 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all resize-none ${
                      errors.about ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-700 focus:ring-red-500/30'
                    }`}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    maxLength={140}
                  />
                  {errors.about && (
                    <p className="text-red-400 text-sm mt-1">{errors.about}</p>
                  )}
                </div>

                {/* Terms removed by request */}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || step3Data.goals.length === 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupWizard;
