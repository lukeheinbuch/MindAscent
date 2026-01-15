import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createClient(req, res)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Accept extended optional fields from signup wizard
    const {
      email,
      full_name,
      avatar_url,
      // Extended profile fields (all optional)
      display_name,
      username,
      sport,
      level,
      age,
      country,
      goals,
      about,
    } = req.body as Partial<{
      email: string;
      full_name: string;
      avatar_url: string;
      display_name: string;
      username: string;
      sport: string;
      level: string;
      age: number;
      country: string;
      goals: string[];
      about: string;
    }>

    // Load existing profile to enforce immutability on username and check if new
    const { data: existingProfile, error: existingErr } = await supabase
      .from('profiles')
      .select('username, current_streak, longest_streak')
      .eq('id', user.id)
      .single();

    if (existingErr && existingErr.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching existing profile:', existingErr)
    }

    // Upsert the profile
    // Build upsert payload only with provided fields to avoid schema mismatches
    const payload: Record<string, any> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };
    // Initialize streaks for brand new profiles
    const isNewProfile = !!(existingErr && (existingErr as any).code === 'PGRST116') || !existingProfile;
    if (isNewProfile) {
      payload.current_streak = 1;
      payload.longest_streak = 1;
    }

    // Ensure email is always present on first insert to satisfy NOT NULL
    // Prefer an explicit email from body if provided; otherwise fall back to the auth user email
    payload.email = (typeof email !== 'undefined' && email) ? email : (user.email ?? null);
    if (typeof full_name !== 'undefined') payload.full_name = full_name || null;
    if (typeof avatar_url !== 'undefined') payload.avatar_url = avatar_url || null;
    if (typeof display_name !== 'undefined') payload.display_name = display_name || null;
    // Username immutability: can only be set once if currently null; cannot be changed afterwards
    if (typeof username !== 'undefined') {
      const incoming = (username || '').trim() || null;
      const current = (existingProfile?.username || '').trim() || null;
      if (current) {
        if (incoming && incoming.toLowerCase() !== current.toLowerCase()) {
          return res.status(409).json({ error: 'Username cannot be changed once set' });
        }
        // Ignore attempts to unset or re-set to the same value
      } else {
        // No current username; allow setting if provided
        if (incoming) payload.username = incoming;
      }
    }
    if (typeof sport !== 'undefined') payload.sport = sport || null;
    if (typeof level !== 'undefined') payload.level = level || null;
    if (typeof age !== 'undefined') payload.age = age ?? null;
    if (typeof country !== 'undefined') payload.country = country || null;
    if (typeof goals !== 'undefined') payload.goals = goals ?? null;
    if (typeof about !== 'undefined') payload.about = about || null;

    // Optional: enforce unique username across profiles
    if (payload.username) {
      const { data: existing, error: checkErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', payload.username)
        .neq('id', user.id)
        .limit(1);
      if (!checkErr && existing && existing.length > 0) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      // If unique constraint on username fires, bubble a 409 so UI can show a friendly message
      const msg = (error as any)?.message || ''
      const code = (error as any)?.code || ''
      if (code === '23505' || /unique|duplicate key/i.test(msg)) {
        return res.status(409).json({ error: 'Username already taken' })
      }
      console.error('Error upserting profile:', error)
      return res.status(500).json({ error: 'Failed to upsert profile' })
    }

    res.status(200).json({ success: true, profile: data })
  } catch (error) {
    console.error('Profile upsert error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
