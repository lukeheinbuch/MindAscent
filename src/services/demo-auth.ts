// Demo authentication service for when Firebase is not configured
export const createDemoUser = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create mock user object that matches Firebase UserCredential structure
  const user = {
    uid: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    emailVerified: true,
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  return {
    user,
    operationType: 'signIn' as const,
    providerId: 'password'
  };
};

export const signInDemoUser = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create mock user object
  const user = {
    uid: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    emailVerified: true,
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  return {
    user,
    operationType: 'signIn' as const,
    providerId: 'password'
  };
};

// Check if we're running in demo mode
export const isDemoMode = () => {
  return !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
         !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
};
