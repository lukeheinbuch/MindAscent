import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabase = createClient(req, res)
    const { event, session } = req.body || {}

    if (event === 'SIGNED_OUT' || !session) {
      await supabase.auth.signOut()
      return res.status(200).json({ ok: true })
    }

    const { error } = await supabase.auth.setSession(session)
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    console.error('Auth callback error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
