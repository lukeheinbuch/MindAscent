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
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
  // Prefer dashboard if available; fallback to '/'
  router.replace('/dashboard')
    }
  }, [loading, user, router])

  if (loading) return null
  if (user) return null
  return <>{children}</>
}
