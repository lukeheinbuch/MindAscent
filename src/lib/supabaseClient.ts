import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_ENABLED = Boolean(url && key)

// Provide a safe shim when Supabase is not configured to prevent crashes during import/render
function createSupabaseShim() {
  const resultPayload = { data: null as any, error: null as any, count: 0 as any }
  const thenable = () => Promise.resolve(resultPayload)
  const chain = {
    select: () => chain,
    eq: () => chain,
    gte: () => chain,
    order: () => chain,
    delete: () => thenable(),
    insert: () => thenable(),
    single: () => thenable(),
    then: thenable as any,
  }
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => { throw new Error('Supabase not configured'); },
      signUp: async () => { throw new Error('Supabase not configured'); },
      signOut: async () => {},
    },
    from: (_table: string) => chain,
  } as any
}

export const supabase = SUPABASE_ENABLED
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : createSupabaseShim()
