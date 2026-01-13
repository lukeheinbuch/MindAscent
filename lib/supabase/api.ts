import { createServerClient } from '@supabase/ssr'
import { NextApiRequest, NextApiResponse } from 'next'

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || '',
          }))
        },
        setAll(cookiesToSet: Array<{name: string, value: string, options?: any}>) {
          // Aggregate multiple cookies and set as an array to avoid overwriting on Vercel
          const cookieHeaders = cookiesToSet.map(({ name, value, options }: {name: string, value: string, options?: any}) => {
            const parts: string[] = []
            parts.push(`${name}=${encodeURIComponent(value)}`)
            parts.push('Path=/')
            if (options) {
              if (options.domain) parts.push(`Domain=${options.domain}`)
              if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
              if (options.expires) parts.push(`Expires=${new Date(options.expires).toUTCString()}`)
              if (options.httpOnly) parts.push('HttpOnly')
              // Default to Lax if provided; string variants supported by Supabase
              if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
              if (options.secure) parts.push('Secure')
            }
            return parts.join('; ')
          })
          const existing = res.getHeader('Set-Cookie')
          if (existing) {
            const arr = Array.isArray(existing) ? existing : [existing as string]
            res.setHeader('Set-Cookie', [...arr, ...cookieHeaders])
          } else {
            res.setHeader('Set-Cookie', cookieHeaders)
          }
        },
      },
    }
  )
}
