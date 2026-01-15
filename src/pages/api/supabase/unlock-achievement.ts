import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

type AchievementUnlockPayload = {
  achievementId: string
  xpReward: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: AchievementUnlockPayload = req.body

    if (!payload.achievementId) {
      return res.status(400).json({ error: 'achievementId is required' })
    }

    if (!payload.xpReward || payload.xpReward < 0) {
      return res.status(400).json({ error: 'xpReward must be a positive number' })
    }

    const supabase = createClient(req, res)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Check if achievement is already unlocked to prevent duplicate XP
    const { data: existingAchievement } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', payload.achievementId)
      .single()

    if (existingAchievement) {
      // Achievement already unlocked
      return res.status(200).json({ success: true, message: 'Achievement already unlocked', isNewUnlock: false })
    }

    // Log the achievement unlock
    const { data: achievementLog, error: achError } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        achievement_id: payload.achievementId,
        unlocked_at: new Date().toISOString(),
        xp_gained: payload.xpReward,
      })
      .select()
      .single()

    if (achError) {
      return res.status(500).json({ error: `Failed to unlock achievement: ${achError.message}` })
    }

    // Award XP - create ledger entry (idempotent check to prevent double rewards)
    const achievementSourceId = `${user.id}_achievement_${payload.achievementId}`

    const { data: existingXP } = await supabase
      .from('xp_ledger')
      .select('id')
      .eq('user_id', user.id)
      .eq('source', 'achievement')
      .eq('source_id', achievementSourceId)
      .single()

    if (!existingXP) {
      // Award XP to ledger
      const { data: xpEntry, error: xpError } = await supabase
        .from('xp_ledger')
        .insert({
          user_id: user.id,
          amount: payload.xpReward,
          source: 'achievement',
          source_id: achievementSourceId,
          description: `Achievement unlocked: ${payload.achievementId}`,
        })
        .select()
        .single()

      if (xpError) {
        console.error('Failed to insert XP ledger entry:', xpError)
        // Don't fail the entire request, just log the error
      }

      // Recompute total XP from ledger (safer than read-modify-write)
      const { data: xpSum } = await supabase
        .from('xp_ledger')
        .select('amount')
        .eq('user_id', user.id)

      const totalXp = xpSum?.reduce((sum, entry) => sum + entry.amount, 0) || 0

      // Update profile with new total XP
      await supabase
        .from('profiles')
        .update({
          total_xp: totalXp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    res.status(200).json({ success: true, achievementLog, isNewUnlock: true })
  } catch (error) {
    console.error('Achievement unlock error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
