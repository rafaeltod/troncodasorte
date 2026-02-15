'use client'

import { useState, useEffect } from 'react'
import { censorName, formatDecimal } from '@/lib/formatters'
import { Trophy } from 'lucide-react'

interface TopBuyer {
  id: string
  name: string
  email: string
  totalSpent: number
  totalLivros: number
  raffleBought: number
}

interface RaffleTopBuyersProps {
  raffleId: string
}

export function RaffleTopBuyers({ raffleId }: RaffleTopBuyersProps) {
  const [buyers, setBuyers] = useState<TopBuyer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopBuyers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/lotes/${raffleId}/top-buyers`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setBuyers(data)
        } else {
          setError('Erro ao buscar compradores')
        }
      } catch (err) {
        console.error('Erro ao buscar top compradores do lote:', err)
        setError('Erro ao buscar dados')
      } finally {
        setLoading(false)
      }
    }

    if (raffleId) {
      fetchTopBuyers()
    }
  }, [raffleId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-black text-gray-900">Top Compradores</h2>
        </div>
        <div className="text-center text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return null
  }

  if (buyers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-black text-gray-900">Top Compradores</h2>
        </div>
        <div className="text-center text-gray-600 py-8">
          Nenhum comprador registrado ainda
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-black text-gray-900">Top Compradores</h2>
      </div>

      <div className="space-y-3">
        {buyers.map((buyer, index) => (
          <div
            key={buyer.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-emerald-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && index + 1}
              </div>
              <div>
                <div className="font-black text-sm text-gray-900">{censorName(buyer.name)}</div>
                <div className="text-xs text-gray-500">
                  {buyer.totalLivros} {buyer.totalLivros === 1 ? 'livro' : 'livros'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-black text-lg text-emerald-600">
                R$ {formatDecimal(buyer.totalSpent)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
