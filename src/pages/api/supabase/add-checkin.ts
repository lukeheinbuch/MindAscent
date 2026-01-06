import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

// stress_management: 1-10 where 10 = excellent stress management (low perceived stress)
type CheckInPayload = {
  date: string // YYYY-MM-DD (client local date)
  mood_rating: number // 1-10
  energy_level: number // 1-10
  stress_management: number // 1-10, higher = better stress management
  // Extended metrics (optional but recommended for overall wellbeing)
  motivation?: number // 1-10
  confidence?: number // 1-10
  focus?: number // 1-10
  recovery?: number // 1-10
  sleep_hours?: number // 1-10 sleep quality score (historically hours)
  notes?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: CheckInPayload = req.body

    // Validate ranges
    if (payload.mood_rating < 1 || payload.mood_rating > 10) {
      return res.status(400).json({ error: 'mood_rating must be between 1 and 10' })
    }
    if (payload.energy_level < 1 || payload.energy_level > 10) {
      return res.status(400).json({ error: 'energy_level must be between 1 and 10' })
    }
    if (payload.stress_management < 1 || payload.stress_management > 10) {
      return res.status(400).json({ error: 'stress_management must be between 1 and 10' })
    }

    const supabase = createClient(req, res)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Check if this check-in already exists (to determine if it's new)
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', payload.date)
      .single()

    const isNewCheckIn = !existingCheckIn

    // Upsert the check-in
    const { data: checkInData, error: checkInError } = await supabase
      .from('check_ins')
      .upsert({
        user_id: user.id,
        date: payload.date,
        mood_rating: payload.mood_rating,
        energy_level: payload.energy_level,
        stress_management: payload.stress_management,
        sleep_hours: payload.sleep_hours ?? null,
        motivation: payload.motivation ?? null,
        confidence: payload.confidence ?? null,
        focus: payload.focus ?? null,
        recovery: payload.recovery ?? null,
        notes: payload.notes ?? null
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (checkInError) {
      return res.status(500).json({ error: `Failed to save check-in: ${checkInError.message}` })
    }

    // Only process XP and streaks for new check-ins
    if (isNewCheckIn) {
      // Award XP (idempotent)
      const startOfDay = new Date(payload.date + 'T00:00:00Z').toISOString()
      const startOfNextDay = new Date(payload.date + 'T23:59:59Z').toISOString()

      const { data: existingXP } = await supabase
        .from('xp_ledger')
        .select('id')
        .eq('user_id', user.id)
        .eq('source', 'check_in')
        .gte('created_at', startOfDay)
        .lte('created_at', startOfNextDay)
        .single()

      if (!existingXP) {
        // Award 10 XP for the check-in
        await supabase
          .from('xp_ledger')
          .insert({
            user_id: user.id,
            amount: 10,
            source: 'check_in',
            description: 'Daily check-in'
          })

        // Recompute total XP from ledger (safer than read-modify-write)
        const { data: xpSum } = await supabase
          .from('xp_ledger')
          .select('amount')
          .eq('user_id', user.id)

        const totalXp = xpSum?.reduce((sum, entry) => sum + entry.amount, 0) || 0

        await supabase
          .from('profiles')
          .update({ total_xp: totalXp })
          .eq('id', user.id)
      }

      // Handle streaks
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_check_in_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        let newCurrentStreak = 1
        let newLongestStreak = profile.longest_streak || 0

        if (profile.last_check_in_date) {
          const lastDate = new Date(profile.last_check_in_date)
          const currentDate = new Date(payload.date)
          const yesterday = new Date(currentDate)
          yesterday.setDate(yesterday.getDate() - 1)

          // Check if last check-in was yesterday (consecutive)
          if (lastDate.toDateString() === yesterday.toDateString()) {
            newCurrentStreak = (profile.current_streak || 0) + 1
          } else if (lastDate.toDateString() === currentDate.toDateString()) {
            // Same day, don't change streak
            newCurrentStreak = profile.current_streak || 1
          }
          // Else: gap in days, streak resets to 1
        }

        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak)

        await supabase
          .from('profiles')
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_check_in_date: payload.date
          })
          .eq('id', user.id)
      }
    }

    res.status(200).json({ success: true, checkIn: checkInData, isNewCheckIn })
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
