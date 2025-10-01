import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function Confirm() {
  const router = useRouter()
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState<string>('Confirming your email…')

  useEffect(() => {
    const run = async () => {
      try {
        // Wait for router to be ready to read query/hash
        if (!router.isReady) return

        // Try modern PKCE/code flow (query param `code`)
        const code = typeof router.query.code === 'string' ? router.query.code : undefined

        let session = null as any
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession({ code })
          if (error) throw error
          session = data.session
        } else {
          // Fallback: token hash flow (older confirm links)
          const token_hash = typeof router.query.token_hash === 'string' ? router.query.token_hash : undefined
          const type = typeof router.query.type === 'string' ? router.query.type : 'email'

          if (token_hash) {
            const { data, error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })
            if (error) throw error
            session = data.session ?? (await supabase.auth.getSession()).data.session
          } else if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            // Very old style hash-based redirect
            const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
            if (error) throw error
            session = data.session
          }
        }

        // If we got a session, set SSR cookie via our API so server routes can read it
        if (session) {
          await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_IN', session })
          })
        }

        // Apply any pending profile captured pre-confirmation
        try {
          const raw = localStorage.getItem('pendingProfile')
          if (raw) {
            const pending = JSON.parse(raw)
            const resp = await fetch('/api/supabase/ensure-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pending)
            })
            if (resp.ok) {
              localStorage.removeItem('pendingProfile')
            }
          }
        } catch (e) {
          // Non-fatal
          console.warn('Failed applying pendingProfile after confirm', e)
        }

        setStatus('done')
        setMessage('Email confirmed — welcome to MindAscent!')
        // Give users a moment to read the success message, then redirect.
        setTimeout(() => {
          router.replace('/dashboard')
        }, 2000)
      } catch (e: any) {
        console.error('Email confirm error:', e)
        setStatus('error')
        setMessage(e?.message || 'This confirmation link is invalid or expired. Please request a new link or log in.')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-3">MindAscent</h1>
        <p className="text-gray-600">{message}</p>
        {status === 'done' && (
          <div className="mt-6">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => router.replace('/dashboard')}
            >
              Continue to Dashboard
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => router.replace('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
