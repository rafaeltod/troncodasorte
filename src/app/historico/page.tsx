'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface Purchase {
  id: string
  raffleId: string
  raffle: {
    title: string
    status: string
    winner: string | null
  }
  quotas: number
  amount: number
  status: string
  createdAt: string
}

export default function HistoricoPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchPurchases = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/purchases`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setPurchases(data)
        }
      } catch (err) {
        console.error('Erro ao buscar compras:', err)
      } finally {
        setPageLoading(false)
      }
    }

    fetchPurchases()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return null
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-4">📊 Histórico de Compras</h1>
          <p className="text-slate-600 text-lg mb-8">
            Você ainda não comprou nenhuma cota
          </p>
          <Link
            href="/rifas"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            Explorar Rifas 🎯
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalQuotas = purchases.reduce((acc, p) => acc + p.quotas, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black text-slate-900 mb-2">📊 Histórico de Compras</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-indigo-100 text-sm font-semibold">Total Gasto</p>
            <p className="text-2xl font-black mt-1">R$ {Number(totalSpent).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-purple-100 text-sm font-semibold">Cotas</p>
            <p className="text-2xl font-black mt-1">{totalQuotas}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-pink-100 text-sm font-semibold">Participações</p>
            <p className="text-2xl font-black mt-1">{purchases.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Link key={purchase.id} href={`/rifas/${purchase.raffleId}`}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-slate-100 cursor-pointer transition transform hover:scale-102">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-lg">{purchase.raffle.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {purchase.quotas} cota{purchase.quotas !== 1 ? 's' : ''} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600">
                      R$ {Number(purchase.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      purchase.raffle.status === 'drawn'
                        ? 'bg-green-100 text-green-800'
                        : purchase.raffle.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {purchase.raffle.status === 'drawn'
                      ? '✅ Sorteada'
                      : purchase.raffle.status === 'open'
                        ? '🔄 Aberta'
                        : '⏸️ Fechada'}
                  </span>

                  {purchase.raffle.status === 'drawn' && purchase.raffle.winner && (
                    <span className="text-sm text-green-600 font-black">
                      🏆 Você ganhou!
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
