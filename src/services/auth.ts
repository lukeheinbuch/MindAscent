import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Demo user for development
const DEMO_USER: User = {
  uid: 'demo-user-123',
  email: 'demo@mindascent.com',
  displayName: 'Demo Athlete',
  photoURL: undefined,
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
};

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    if (!isFirebaseConfigured) {
      // Demo mode - simulate successful signup
      console.log('Demo mode: Simulating user signup');
      const demoUser = {
        ...DEMO_USER,
        email,
        displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      // Store in localStorage for demo persistence
      localStorage.setItem('mindascent_demo_user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName });
      
      // Create user document in Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<User> {
    if (!isFirebaseConfigured) {
      // Demo mode - simulate successful login
      console.log('Demo mode: Simulating user login');
      const demoUser = {
        ...DEMO_USER,
        email,
        lastLoginAt: new Date(),
      };
      
      // Store in localStorage for demo persistence
      localStorage.setItem('mindascent_demo_user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      
      // Update last login time
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data() as User;
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData?.displayName,
        photoURL: firebaseUser.photoURL || userData?.photoURL,
        createdAt: userData?.createdAt || new Date(),
        lastLoginAt: new Date(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    if (!isFirebaseConfigured) {
      // Demo mode - clear local storage
      console.log('Demo mode: Simulating user logout');
      localStorage.removeItem('mindascent_demo_user');
      return;
    }

    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    if (!isFirebaseConfigured) {
      // Demo mode - return mock user if exists in localStorage
      const demoUser = localStorage.getItem('mindascent_demo_user');
      return demoUser ? JSON.parse(demoUser) : null;
    }
    
    return auth.currentUser;
  }

  // Convert Firebase user to our User type
  static async convertFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    if (!isFirebaseConfigured) {
      // Demo mode - return demo user
      const stored = localStorage.getItem('mindascent_demo_user');
      return stored ? JSON.parse(stored) : DEMO_USER;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName,
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      lastLoginAt: userData?.lastLoginAt?.toDate() || new Date(),
    };
  }

  // Demo mode helper - get stored demo user
  static getDemoUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('mindascent_demo_user');
    return stored ? JSON.parse(stored) : null;
  }
}
