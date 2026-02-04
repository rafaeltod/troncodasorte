import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuthCheck() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!user || !token) {
      router.push('/auth/login')
      return
    }

    setIsAuthenticated(true)
  }, [isMounted, router])

  return { isMounted, isAuthenticated }
}
