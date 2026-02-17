'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import { Trophy } from 'lucide-react'

interface Buyer {
  id: string
  name: string
  email: string
  totalSpent: number
  totalLivros: number
  raffleBought: number
}

export default function TopBuyersPage() {
  const { loading } = useAuth()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {buyers.length > 0 ? (
          <div className="space-y-4">
            {buyers.map((buyer, index) => (
              <div
                key={buyer.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-200 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-full font-black text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </div>
                  <div>
                    <div className="font-black text-lg text-gray-900">{censorName(buyer.name)}</div>
                    <div className="text-sm text-gray-600">
                      {buyer.raffleBought} lote{buyer.raffleBought !== 1 ? 's' : ''} • {buyer.totalLivros} livros
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600">
                    R$ {Number(buyer.totalSpent).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <p className="text-gray-600 font-semibold text-lg">Nenhum comprador registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
