import { createClient } from './client'

export async function addCheckIn(checkInData: {
  date: string
  mood: number
  stress_management: number
  energy: number
  motivation?: number
  confidence?: number
  focus?: number
  recovery?: number
  sleep?: number // sleep quality 1-10
  soreness?: number
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
      sleep_hours: checkInData.sleep ?? null,
      motivation: checkInData.motivation ?? null,
      confidence: checkInData.confidence ?? null,
      focus: checkInData.focus ?? null,
      recovery: checkInData.recovery ?? null,
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

// Update user profile with XP and level
export async function updateUserProfile(updates: {
  total_xp?: number
  current_level?: number
  current_streak?: number
  badges?: string[]
}) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      total_xp: updates.total_xp,
      current_level: updates.current_level,
      current_streak: updates.current_streak,
      badges: updates.badges,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

// Log daily task completion
export async function logDailyTask(taskId: string, xpGained: number) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_tasks')
    .insert({
      user_id: user.id,
      task_id: taskId,
      date: today,
      xp_gained: xpGained,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to log daily task: ${error.message}`)
  }

  return data
}

// Get today's completed tasks
export async function getTodayTasks(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch today's tasks: ${error.message}`)
  }

  return data || []
}

// Log achievement unlock
export async function logAchievement(achievementId: string, xpGained: number) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: user.id,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
      xp_gained: xpGained,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to log achievement: ${error.message}`)
  }

  return data
}

// Get user achievements
export async function getUserAchievements(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch achievements: ${error.message}`)
  }

  return data || []
}

// Upload photo
export async function uploadPhoto(file: File, userId: string) {
  const supabase = createClient()

  // Create a unique filename
  const timestamp = Date.now()
  const filename = `${userId}/${timestamp}_${file.name}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(filename)

  // Log photo in database
  const { data: photoData, error: dbError } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      file_path: filename,
      public_url: publicUrl,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (dbError) {
    throw new Error(`Failed to save photo metadata: ${dbError.message}`)
  }

  return photoData
}

// Get user photos
export async function getUserPhotos(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`)
  }

  return data || []
}
