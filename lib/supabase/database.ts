import { createClient } from './client'

export async function addCheckIn(checkInData: {
  date: string
  mood: number
  stress_management: number
  energy: number
  motivation: number
  sleep?: number
  soreness?: number
  focus?: number
  training_load?: 'none' | 'light' | 'moderate' | 'hard'
  pre_competition?: boolean
  note?: string
}) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // Insert the check-in
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      date: checkInData.date,
      mood_rating: checkInData.mood,
      stress_management: checkInData.stress_management,
      energy_level: checkInData.energy,
      // Note: motivation is not in the DB schema but we'll store it in notes for now
      sleep_hours: checkInData.sleep || 8,
      notes: checkInData.note || null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save check-in: ${error.message}`)
  }

  return data
}

export async function getCheckIns(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch check-ins: ${error.message}`)
  }

  return data
}

export async function getTodayCheckIn(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Failed to fetch today's check-in: ${error.message}`)
  }

  return data
}
