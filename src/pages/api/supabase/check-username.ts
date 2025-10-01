import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username } = req.body as { username?: string }
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username' })
    }

    const supabase = createClient(req, res)
    // Prefer a SECURITY DEFINER RPC if present to bypass RLS for exact, reliable checks
    try {
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('is_username_available', { u: username })
      if (!rpcError && typeof rpcData === 'boolean') {
        return res.status(200).json({ available: rpcData })
      }
    } catch {}

    // Fallback best-effort under RLS: case-insensitive match (may not see other users due to RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .limit(1)

    if (error) {
      console.error('username check error:', error)
      return res.status(500).json({ error: 'Failed to check username' })
    }

    const available = !data || data.length === 0
    return res.status(200).json({ available })
  } catch (e) {
    console.error('check-username error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
