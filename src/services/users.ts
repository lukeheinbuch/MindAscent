import { 
  doc, 
  setDoc, 
  getDoc, 
  runTransaction,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from './firebase';
import { UserProfile } from '@/types/user';
import { isDemoMode } from './demo-auth';

export class UserService {
  /**
   * Reserve a username and create user profile in a transaction
   */
  static async reserveUsername(username: string, uid: string): Promise<void> {
    if (!isFirebaseEnabled || !db) {
      // In demo / disabled Firestore mode just succeed.
      return;
    }
    await runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, 'usernames', username);
      const usernameDoc = await transaction.get(usernameRef);
      
      if (usernameDoc.exists()) {
        throw new Error('Username is already taken');
      }
      
      // Reserve the username
      transaction.set(usernameRef, { uid });
    });
  }

  /**
   * Create a complete user profile
   */
  static async createUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    if (isDemoMode()) {
      // In demo mode, just store in localStorage for demonstration
      console.log('Demo mode: Storing user profile locally for UID:', uid);
      const fullProfile: UserProfile = {
        uid,
        email: profileData.email || '',
        username: profileData.username || '',
        age: profileData.age || 0,
        sport: profileData.sport || '',
        level: profileData.level || 'Recreational',
        experience: profileData.experience || 'Beginner',
        goals: profileData.goals || [],
        country: profileData.country,
        about: profileData.about,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        xp: 0,
        levelNum: 1,
        streak: 0,
        badges: [],
        preferences: {
          theme: 'dark',
          range: '30d'
        },
        ...profileData
      };
      
      // Store in localStorage for demo
      localStorage.setItem(`demo_user_${uid}`, JSON.stringify(fullProfile));
      localStorage.setItem(`demo_username_${profileData.username}`, uid);
      return;
    }

    if (!isFirebaseEnabled || !db) {
      // Firestore disabled but not in explicit demo path: store locally
      const now = Date.now();
      const fullProfile: UserProfile = {
        uid,
        email: profileData.email || '',
        username: profileData.username || '',
        age: profileData.age || 0,
        sport: profileData.sport || '',
        level: profileData.level || 'Recreational',
        experience: profileData.experience || 'Beginner',
        goals: profileData.goals || [],
        country: profileData.country,
        about: profileData.about,
        createdAt: now,
        lastLoginAt: now,
        xp: 0,
        levelNum: 1,
        streak: 0,
        badges: [],
        preferences: { theme: 'dark', range: '30d' },
        ...profileData
      };
      localStorage.setItem(`fallback_user_${uid}`, JSON.stringify(fullProfile));
      return;
    }

    await runTransaction(db, async (transaction) => {
      // Check if username is still available
      if (profileData.username) {
        const usernameRef = doc(db, 'usernames', profileData.username);
        const usernameDoc = await transaction.get(usernameRef);
        
        if (usernameDoc.exists() && usernameDoc.data()?.uid !== uid) {
          throw new Error('Username is already taken');
        }
        
        // Reserve the username if not already reserved
        if (!usernameDoc.exists()) {
          transaction.set(usernameRef, { uid });
        }
      }
      
      // Create the user profile
      const userRef = doc(db, 'users', uid);
      const now = Date.now();
      
      const fullProfile: UserProfile = {
        uid,
        email: profileData.email || '',
        username: profileData.username || '',
        age: profileData.age || 0,
        sport: profileData.sport || '',
        level: profileData.level || 'Recreational',
        experience: profileData.experience || 'Beginner',
        goals: profileData.goals || [],
        country: profileData.country,
        about: profileData.about,
        createdAt: now,
        lastLoginAt: now,
        xp: 0,
        levelNum: 1,
        streak: 0,
        badges: [],
        preferences: {
          theme: 'dark',
          range: '30d'
        },
        ...profileData
      };
      
      transaction.set(userRef, fullProfile);
    });
  }

  /**
   * Get user profile by UID
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseEnabled || !db) {
      const local = localStorage.getItem(`demo_user_${uid}`) || localStorage.getItem(`fallback_user_${uid}`);
      return local ? JSON.parse(local) as UserProfile : null;
    }
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(uid: string): Promise<void> {
    if (!isFirebaseEnabled || !db) return; // nothing to do
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      if (isDemoMode()) {
        // In demo mode, check localStorage
        const existingUid = localStorage.getItem(`demo_username_${username}`);
        return !existingUid;
      }
      if (!isFirebaseEnabled || !db) {
        return true; // assume available when Firestore disabled
      }
      
      // For demo purposes, we'll just do basic validation
      // In a real app, you'd check against Firestore
      
      // Basic validation - username should be available if it meets criteria
      if (!username || username.length < 3 || username.length > 20) {
        return false;
      }
      
      // For now, allow all usernames that meet the basic criteria
      // In production, you would check Firestore here
      return true;
      
    } catch (error) {
      console.error('Error checking username availability:', error);
      // Return true on error to not block users from signing up
      return true;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseEnabled || !db) {
      const local = localStorage.getItem(`demo_user_${uid}`) || localStorage.getItem(`fallback_user_${uid}`);
      if (local) {
        const parsed = JSON.parse(local);
        const updated = { ...parsed, ...updates };
        localStorage.setItem(`demo_user_${uid}`, JSON.stringify(updated));
      }
      return;
    }
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
