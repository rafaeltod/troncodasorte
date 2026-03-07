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
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {buyers.length > 0 ? (
          <div className="space-y-4">
            {buyers.map((buyer, index) => (
              <div
                key={buyer.id}
                className="bg-branco dark:bg-[#232F3E] rounded-xl shadow-md hover:shadow-lg p-6 border border-cinza dark:border-gray-700 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-azul-royal dark:bg-azul-claro/20 text-branco dark:text-azul-claro rounded-full font-black text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </div>
                  <div>
                    <div className="font-black text-lg text-cinza-escuro dark:text-cinza-claro">{censorName(buyer.name)}</div>
                    <div className="text-sm text-cinza dark:text-gray-400">
                      {buyer.raffleBought} lote{buyer.raffleBought !== 1 ? 's' : ''} • {buyer.totalLivros} livros
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-azul-royal dark:text-azul-claro">
                    R$ {Number(buyer.totalSpent).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-branco dark:bg-[#232F3E] rounded-xl shadow-md p-12 text-center border border-cinza dark:border-gray-700">
            <p className="text-cinza dark:text-gray-400 font-semibold text-lg">Nenhum comprador registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}