import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) return null
  if (!user) return null
  return <>{children}</>
}

export const RequireGuest = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth()

  // Only gate rendering during initial auth check; do not redirect if already authenticated.
  if (loading) return null
  return <>{children}</>
}
