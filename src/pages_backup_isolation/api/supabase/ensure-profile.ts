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

    const { email, full_name, avatar_url } = req.body

    // Upsert the profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        full_name: full_name || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting profile:', error)
      return res.status(500).json({ error: 'Failed to upsert profile' })
    }

    res.status(200).json({ success: true, profile: data })
  } catch (error) {
    console.error('Profile upsert error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
