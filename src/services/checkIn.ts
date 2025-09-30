import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { CheckInData, StreakData } from '@/types';
import { gamificationService, XP_REWARDS } from './gamification';

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export class CheckInService {
  // Save check-in data
  static async saveCheckIn(userId: string, checkInData: Omit<CheckInData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CheckInData> {
    const today = new Date().toISOString().split('T')[0];
    const checkInId = `${userId}_${today}`;
    
    const newCheckIn: CheckInData = {
      id: checkInId,
      userId,
      ...checkInData,
      date: today,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!isFirebaseConfigured) {
      // Demo mode - save only to localStorage
      console.log('CheckInService: Demo mode - saving to localStorage');
      this.saveToLocalStorage(checkInId, newCheckIn);
      this.updateStreakDataLocal(userId, today);
      
      // Award XP and update streaks for check-in
      await gamificationService.awardXP(userId, XP_REWARDS.DAILY_CHECKIN, 'check-in', 'Daily check-in completed', { date: today });
      await gamificationService.updateStreak(userId, today);
      
      return newCheckIn;
    }

    try {
      // Save to Firestore
      await setDoc(doc(db, 'checkins', checkInId), {
        ...newCheckIn,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Save to local storage for offline access
      this.saveToLocalStorage(checkInId, newCheckIn);
      
      // Update streak data
      await this.updateStreakData(userId, today);
      
      // Award XP and update streaks for check-in
      await gamificationService.awardXP(userId, XP_REWARDS.DAILY_CHECKIN, 'check-in', 'Daily check-in completed', { date: today });
      await gamificationService.updateStreak(userId, today);

      return newCheckIn;
    } catch (error: any) {
      // Fallback to local storage if Firebase fails
      console.warn('Firebase save failed, using localStorage:', error.message);
      this.saveToLocalStorage(checkInId, newCheckIn);
      this.updateStreakDataLocal(userId, today);
      return newCheckIn;
    }
  }

  // Get check-in for specific date
  static async getCheckIn(userId: string, date: string): Promise<CheckInData | null> {
    try {
      const checkInId = `${userId}_${date}`;
      
      // Try Firestore first
      const docRef = doc(db, 'checkins', checkInId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: checkInId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CheckInData;
      }
      
      // Fallback to local storage
      return this.getFromLocalStorage(checkInId);
    } catch (error) {
      // Fallback to local storage
      return this.getFromLocalStorage(`${userId}_${date}`);
    }
  }

  // Get recent check-ins
  static async getRecentCheckIns(userId: string, limitCount: number = 7): Promise<CheckInData[]> {
    try {
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as CheckInData[];
    } catch (error) {
      // Fallback to local storage
      return this.getRecentFromLocalStorage(userId, limitCount);
    }
  }

  // Update streak data
  private static async updateStreakData(userId: string, checkInDate: string): Promise<void> {
    try {
      const streakDoc = doc(db, 'streaks', userId);
      const streakSnap = await getDoc(streakDoc);
      
      let streakData: StreakData;
      
      if (streakSnap.exists()) {
        const existing = streakSnap.data() as StreakData;
        const lastDate = new Date(existing.lastCheckInDate);
        const currentDate = new Date(checkInDate);
        const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          streakData = {
            ...existing,
            currentStreak: existing.currentStreak + 1,
            longestStreak: Math.max(existing.longestStreak, existing.currentStreak + 1),
            lastCheckInDate: checkInDate,
            totalCheckIns: existing.totalCheckIns + 1,
          };
        } else if (daysDiff === 0) {
          // Same day (update)
          streakData = {
            ...existing,
            lastCheckInDate: checkInDate,
          };
        } else {
          // Streak broken
          streakData = {
            ...existing,
            currentStreak: 1,
            lastCheckInDate: checkInDate,
            totalCheckIns: existing.totalCheckIns + 1,
          };
        }
      } else {
        // First check-in
        streakData = {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCheckInDate: checkInDate,
          totalCheckIns: 1,
        };
      }
      
      await setDoc(streakDoc, streakData);
    } catch (error) {
      console.error('Failed to update streak data:', error);
    }
  }

  // Get streak data
  static async getStreakData(userId: string): Promise<StreakData | null> {
    try {
      const streakDoc = doc(db, 'streaks', userId);
      const streakSnap = await getDoc(streakDoc);
      
      if (streakSnap.exists()) {
        return streakSnap.data() as StreakData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get streak data:', error);
      return null;
    }
  }

  // Local storage helpers
  private static saveToLocalStorage(checkInId: string, checkIn: CheckInData): void {
    try {
      const stored = localStorage.getItem('mindascent_checkins');
      const checkins = stored ? JSON.parse(stored) : {};
      checkins[checkInId] = checkIn;
      localStorage.setItem('mindascent_checkins', JSON.stringify(checkins));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  private static getFromLocalStorage(checkInId: string): CheckInData | null {
    try {
      const stored = localStorage.getItem('mindascent_checkins');
      if (stored) {
        const checkins = JSON.parse(stored);
        const checkIn = checkins[checkInId];
        if (checkIn) {
          return {
            ...checkIn,
            createdAt: new Date(checkIn.createdAt),
            updatedAt: new Date(checkIn.updatedAt),
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get from local storage:', error);
      return null;
    }
  }

  private static getRecentFromLocalStorage(userId: string, limitCount: number): CheckInData[] {
    try {
      const stored = localStorage.getItem('mindascent_checkins');
      if (stored) {
        const checkins = JSON.parse(stored);
        return Object.values(checkins)
          .filter((checkIn: any) => checkIn.userId === userId)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limitCount)
          .map((checkIn: any) => ({
            ...checkIn,
            createdAt: new Date(checkIn.createdAt),
            updatedAt: new Date(checkIn.updatedAt),
          }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get recent from local storage:', error);
      return [];
    }
  }

  // Local storage utility methods for demo mode
  static updateStreakDataLocal(userId: string, checkInDate: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const currentStreak = this.getStreakDataLocal(userId);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      let newCurrentStreak = 1;
      let newLongestStreak = Math.max(currentStreak.longestStreak, 1);
      
      if (currentStreak.lastCheckInDate === yesterdayString) {
        // Consecutive day
        newCurrentStreak = currentStreak.currentStreak + 1;
        newLongestStreak = Math.max(currentStreak.longestStreak, newCurrentStreak);
      } else if (currentStreak.lastCheckInDate !== checkInDate) {
        // Gap in streak, reset to 1
        newCurrentStreak = 1;
      } else {
        // Same day update
        newCurrentStreak = currentStreak.currentStreak;
        newLongestStreak = currentStreak.longestStreak;
      }

      const updatedStreak: StreakData = {
        userId,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCheckInDate: checkInDate,
        totalCheckIns: currentStreak.totalCheckIns + (currentStreak.lastCheckInDate !== checkInDate ? 1 : 0),
      };

      this.saveStreakToLocalStorage(userId, updatedStreak);
    } catch (error) {
      console.error('Error updating streak data in localStorage:', error);
    }
  }

  static getStreakDataLocal(userId: string): StreakData {
    if (typeof window === 'undefined') {
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: '',
        totalCheckIns: 0,
      };
    }
    
    try {
      const existingData = localStorage.getItem('mindascent_streaks');
      if (!existingData) {
        return {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckInDate: '',
          totalCheckIns: 0,
        };
      }
      
      const streaks = JSON.parse(existingData);
      return streaks[userId] || {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: '',
        totalCheckIns: 0,
      };
    } catch (error) {
      console.error('Error getting streak data from localStorage:', error);
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: '',
        totalCheckIns: 0,
      };
    }
  }

  static saveStreakToLocalStorage(userId: string, streakData: StreakData): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existingData = localStorage.getItem('mindascent_streaks');
      const streaks = existingData ? JSON.parse(existingData) : {};
      streaks[userId] = streakData;
      localStorage.setItem('mindascent_streaks', JSON.stringify(streaks));
    } catch (error) {
      console.error('Error saving streak to localStorage:', error);
    }
  }
}
