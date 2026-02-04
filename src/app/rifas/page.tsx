'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/raffle-card'

interface Raffle {
  id: string
  title: string
  description: string
  prizeAmount: number
  quotaPrice: number
  totalQuotas: number
  soldQuotas: number
  status: string
  image?: string
  createdAt: string
}

export default function RafflesPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/rifas')
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
      }
    } catch (err) {
      console.error('Erro ao buscar rifas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchRaffles()
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-black text-slate-900 mb-2">🎯 Todas as Rifas</h1>
        <p className="text-slate-600 font-semibold mb-12">Escolha uma rifa e comece a participar!</p>

        {raffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} {...raffle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg font-semibold">Nenhuma rifa disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}
