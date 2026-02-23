'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

interface VendedorRouteProps {
  children: React.ReactNode
}

export function VendedorRoute({ children }: VendedorRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!user.isVendedor && !user.isAdmin) {
      router.push('/')
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!user || (!user.isVendedor && !user.isAdmin)) {
    return null
  }

  return <>{children}</>
}
