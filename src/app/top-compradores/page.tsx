'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

interface Buyer {
  id: string
  name: string
  email: string
  totalSpent: number
  totalQuotas: number
  raffleBought: number
}

export default function TopBuyersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchTopBuyers = async () => {
      try {
        const response = await fetch('/api/top-buyers', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setBuyers(data)
        }
      } catch (err) {
        console.error('Erro ao buscar top compradores:', err)
      } finally {
        setPageLoading(false)
      }
    }

    fetchTopBuyers()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-black text-slate-900 mb-2">🏆 Top 5 Compradores</h1>
        <p className="text-slate-600 font-semibold mb-8">Os maiores compradores da plataforma</p>

        {buyers.length > 0 ? (
          <div className="space-y-4">
            {buyers.map((buyer, index) => (
              <div
                key={buyer.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-slate-100 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full font-black text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </div>
                  <div>
                    <div className="font-black text-lg text-slate-900">{buyer.name}</div>
                    <div className="text-sm text-slate-600">
                      {buyer.raffleBought} rifa{buyer.raffleBought !== 1 ? 's' : ''} • {buyer.totalQuotas} cotas
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-600">
                    R$ {Number(buyer.totalSpent).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-100">
            <p className="text-slate-600 font-semibold text-lg">Nenhum comprador registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
