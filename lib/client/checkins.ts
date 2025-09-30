// stress_management: 1-10 where 10 = excellent stress management (low perceived stress)
export type CheckInPayload = {
  date: string // YYYY-MM-DD (client local date)
  mood_rating: number // 1-10
  energy_level: number // 1-10
  stress_management: number // 1-10, higher = better stress management
  sleep_hours?: number
  notes?: string
}

export async function submitCheckIn(payload: CheckInPayload) {
  try {
    const response = await fetch('/api/supabase/add-checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit check-in')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to submit check-in:', error)
    throw error
  }
}

export async function completeOnboardingProfile(input: {
  email: string
  full_name?: string
  avatar_url?: string
  experience_level?: string
  goals?: string
}) {
  try {
    const response = await fetch('/api/supabase/ensure-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to complete profile onboarding')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to complete profile onboarding:', error)
    throw error
  }
}
