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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { CheckIn, CheckInFormData, DailyIndex } from '@/types/checkin';
import { supabase } from '../lib/supabaseClient';

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export class CheckInService {
  private static getDemoCheckInsKey(userId: string): string {
    return `demo_checkins_${userId}`;
  }

  private static getDemoDailyKey(userId: string): string {
    return `demo_daily_${userId}`;
  }

  private static getDemoCheckIns(userId: string): CheckIn[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.getDemoCheckInsKey(userId));
    return stored ? JSON.parse(stored) : [];
  }

  private static saveDemoCheckIns(userId: string, checkIns: CheckIn[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getDemoCheckInsKey(userId), JSON.stringify(checkIns));
  }

  private static getDemoDaily(userId: string): Record<string, DailyIndex> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(this.getDemoDailyKey(userId));
    return stored ? JSON.parse(stored) : {};
  }

  private static saveDemoDaily(userId: string, daily: Record<string, DailyIndex>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getDemoDailyKey(userId), JSON.stringify(daily));
  }
  static async saveCheckIn(userId: string, data: CheckInFormData): Promise<CheckIn> {
    const date = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today to prevent duplicates
    const existingStatus = await this.getTodayStatus(userId);
    if (existingStatus.checkedIn) {
      throw new Error('You have already checked in today. Use the edit feature to update your check-in.');
    }
    
    const timestamp = Date.now();
    const checkInId = `${date}_${timestamp}`;
    
    const checkInData: CheckIn = {
      id: checkInId,
      userId,
      date,
      timestamp,
      ...data
    };

  if (!isFirebaseConfigured) {
      // Demo mode - store in localStorage
      console.log('Demo mode: Saving check-in to localStorage');
      
      const checkIns = this.getDemoCheckIns(userId);
      checkIns.push(checkInData);
      this.saveDemoCheckIns(userId, checkIns);
      
      const daily = this.getDemoDaily(userId);
      daily[date] = {
        checkedIn: true,
        checkInRef: checkInId,
        date
      };
      this.saveDemoDaily(userId, daily);
      
      // Cache locally
      localStorage.setItem(`checkIn_${date}`, JSON.stringify(checkInData));
      
  // Also sync to Supabase so charts reflect this entry
  await this.syncSupabaseCheckIn(userId, checkInData);
  return checkInData;
    }

    const batch = writeBatch(db);
    
    // Save check-in document
    const checkInRef = doc(db, `users/${userId}/checkIns/${checkInId}`);
    batch.set(checkInRef, checkInData);
    
    // Update daily index
    const dailyRef = doc(db, `users/${userId}/daily/${date}`);
    const dailyData: DailyIndex = {
      checkedIn: true,
      checkInRef: checkInId,
      date
    };
    batch.set(dailyRef, dailyData);
    
    await batch.commit();
    
    // Cache locally
    localStorage.setItem(`checkIn_${date}`, JSON.stringify(checkInData));
  // Also sync to Supabase so charts reflect this entry
  await this.syncSupabaseCheckIn(userId, checkInData);

    return checkInData;
  }

  static async updateCheckIn(userId: string, checkInId: string, data: CheckInFormData): Promise<CheckIn> {
    try {
      if (!isFirebaseConfigured) {
        // Demo mode - update in localStorage
        console.log('Demo mode: Updating check-in in localStorage');
        
        const checkIns = this.getDemoCheckIns(userId);
        const index = checkIns.findIndex(ci => ci.id === checkInId);
        
        if (index === -1) {
          throw new Error('Check-in not found');
        }
        
        const existingData = checkIns[index];
        
        if (existingData.userId !== userId) {
          throw new Error('Unauthorized: Check-in does not belong to this user');
        }
        
        const updatedData: CheckIn = {
          ...existingData,
          ...data,
          timestamp: Date.now()
        };
        
        checkIns[index] = updatedData;
        this.saveDemoCheckIns(userId, checkIns);
        
  // Update cache
        localStorage.setItem(`checkIn_${existingData.date}`, JSON.stringify(updatedData));
  // Sync to Supabase
  await this.syncSupabaseCheckIn(userId, updatedData);

        return updatedData;
      }

      const checkInRef = doc(db, `users/${userId}/checkIns/${checkInId}`);
      const existingDoc = await getDoc(checkInRef);
      
      if (!existingDoc.exists()) {
        throw new Error('Check-in not found');
      }
      
      const existingData = existingDoc.data() as CheckIn;
      
      // Validate that this check-in belongs to the user
      if (existingData.userId !== userId) {
        throw new Error('Unauthorized: Check-in does not belong to this user');
      }
      
      const updatedData: CheckIn = {
        ...existingData,
        ...data,
        timestamp: Date.now() // Update timestamp for edit tracking
      };
      
      await setDoc(checkInRef, updatedData);
      
      // Update cache
      localStorage.setItem(`checkIn_${existingData.date}`, JSON.stringify(updatedData));
      // Sync to Supabase
      await this.syncSupabaseCheckIn(userId, updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }
  }

  // Ensure Supabase charts stay in sync with check-ins
  private static async syncSupabaseCheckIn(userId: string, ci: CheckIn): Promise<void> {
    try {
      // Fallback to current auth user if userId is falsy
      let supaUserId = userId;
      if (!supaUserId) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) supaUserId = data.user.id;
      }
      if (!supaUserId) return;

      console.log(`[Checkin Sync] Syncing check-in to Supabase for user ${supaUserId}, date ${ci.date}`, { note: (ci as any).note });

      // Remove any existing row for this user/date to avoid duplicates without requiring a unique index
      await supabase
        .from('check_ins')
        .delete()
        .eq('user_id', supaUserId)
        .eq('date', ci.date);

  // Insert current values; columns aligned to useUserProgress selector
  // New metrics are optional; Supabase will ignore unknown columns if they don't exist
      // Only include baseline columns that are known to exist by default.
  // To capture more metrics, add columns in Supabase: motivation, confidence, focus, recovery.
      const { error } = await supabase
        .from('check_ins')
        .insert([
          {
            user_id: supaUserId,
            date: ci.date,
            mood_rating: ci.mood,
            stress_management: ci.stress_management,
            energy_level: ci.energy,
            sleep_hours: ci.sleep,
    motivation: (ci as any).motivation,
    confidence: (ci as any).confidence,
    focus: (ci as any).focus,
    recovery: (ci as any).recovery,
    note: (ci as any).note,
          },
        ]);
      if (error) {
        console.warn('Supabase sync insert failed:', error.message);
      } else {
        console.log(`[Checkin Sync] Successfully synced check-in with note: ${(ci as any).note ? 'YES' : 'NO'}`);
      }
    } catch (e: any) {
      console.warn('Supabase sync failed:', e?.message || e);
    }
  }

  static async getTodayStatus(userId: string): Promise<{ checkedIn: boolean; checkIn?: CheckIn }> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check cache first
      const cached = localStorage.getItem(`checkIn_${today}`);
      if (cached) {
        try {
          const checkIn = JSON.parse(cached) as CheckIn;
          // Validate cached data structure
          if (checkIn.id && checkIn.userId === userId && checkIn.date === today) {
            return { checkedIn: true, checkIn };
          } else {
            // Invalid cache, remove it
            localStorage.removeItem(`checkIn_${today}`);
          }
        } catch (parseError) {
          // Invalid cache, remove it
          localStorage.removeItem(`checkIn_${today}`);
        }
      }
      
      if (!isFirebaseConfigured) {
        // Demo mode - check localStorage
        console.log('Demo mode: Checking today status from localStorage');
        
        const daily = this.getDemoDaily(userId);
        const todayData = daily[today];
        
        if (!todayData || !todayData.checkedIn) {
          return { checkedIn: false };
        }
        
        const checkIns = this.getDemoCheckIns(userId);
        const checkIn = checkIns.find(ci => ci.id === todayData.checkInRef && ci.date === today);
        
        if (checkIn && checkIn.userId === userId) {
          // Cache it
          localStorage.setItem(`checkIn_${today}`, JSON.stringify(checkIn));
          return { checkedIn: true, checkIn };
        }
        
        return { checkedIn: false };
      }
      
      // Check daily index
      const dailyRef = doc(db, `users/${userId}/daily/${today}`);
      const dailyDoc = await getDoc(dailyRef);
      
      if (!dailyDoc.exists() || !dailyDoc.data()?.checkedIn) {
        return { checkedIn: false };
      }
      
      // Get full check-in data
      const checkInId = dailyDoc.data()?.checkInRef;
      if (checkInId) {
        const checkInRef = doc(db, `users/${userId}/checkIns/${checkInId}`);
        const checkInDoc = await getDoc(checkInRef);
        
        if (checkInDoc.exists()) {
          const checkIn = checkInDoc.data() as CheckIn;
          // Validate data integrity
          if (checkIn.userId === userId && checkIn.date === today) {
            // Cache it
            localStorage.setItem(`checkIn_${today}`, JSON.stringify(checkIn));
            return { checkedIn: true, checkIn };
          } else {
            console.warn('Data integrity issue: check-in data does not match user or date');
          }
        }
      }
      
      return { checkedIn: false };
    } catch (error) {
      console.error('Error getting today status:', error);
      // On error, assume not checked in to allow user to try again
      return { checkedIn: false };
    }
  }

  static async getCheckIns(userId: string, days?: number): Promise<CheckIn[]> {
    if (!isFirebaseConfigured) {
      // Demo mode - get from localStorage
      console.log('Demo mode: Getting check-ins from localStorage');
      const checkIns = this.getDemoCheckIns(userId)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      return days ? checkIns.slice(0, days) : checkIns;
    }

    const checkInsRef = collection(db, `users/${userId}/checkIns`);
    let q = query(checkInsRef, orderBy('timestamp', 'desc'));
    
    if (days) {
      q = query(q, limit(days));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CheckIn);
  }

  static async getCheckInsByDateRange(userId: string, startDate: string, endDate: string): Promise<CheckIn[]> {
    if (!isFirebaseConfigured) {
      // Demo mode - filter by date range
      console.log('Demo mode: Getting check-ins by date range from localStorage');
      return this.getDemoCheckIns(userId)
        .filter(ci => ci.date >= startDate && ci.date <= endDate)
        .sort((a, b) => b.timestamp - a.timestamp);
    }

    const checkInsRef = collection(db, `users/${userId}/checkIns`);
    const q = query(
      checkInsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CheckIn);
  }
}
