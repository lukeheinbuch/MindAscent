import { createClient } from '../supabase/client'

export async function getDashboardDataClient(days = 30) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  // Calculate date range
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Fetch check-ins for the last N days
  const { data: checkIns, error: checkInsError } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (checkInsError) {
    console.error('Error fetching check-ins:', checkInsError)
    return null
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, total_xp, current_level')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return null
  }

  // Calculate total XP from ledger (as backup/verification)
  const { data: xpEntries } = await supabase
    .from('xp_ledger')
    .select('amount')
    .eq('user_id', user.id)

  const calculatedTotalXp = xpEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0

  return {
    checkIns: checkIns || [],
    profile: {
      ...profile,
      total_xp: profile?.total_xp || calculatedTotalXp
    },
    totalXp: profile?.total_xp || calculatedTotalXp
  }
}
