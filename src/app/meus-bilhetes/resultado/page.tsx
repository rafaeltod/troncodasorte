'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ticket, Eye } from 'lucide-react'
import { censorName, censorPhone } from '@/lib/formatters'

interface Purchase {
  id: string
  livros: number
  amount: number
  status: string
  createdAt: string
  raffleTitle: string
  raffleStatus: string
}

interface TicketData {
  user: {
    name: string
    email: string
    phone: string
    cpf: string
  }
  purchases: Purchase[]
}

export default function TicketsResultPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketData, setTicketData] = useState<TicketData | null>(null)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const queryData = localStorage.getItem('ticketQuery')
        if (!queryData) {
          router.push('/meus-bilhetes')
          return
        }

        const { phone, cpf } = JSON.parse(queryData)

        const response = await fetch('/api/auth/check-tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, cpf }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erro ao buscar compras')
        }

        const data = await response.json()
        setTicketData(data)
        // Não remove ticketQuery para permitir voltar à página sem perder dados
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar bilhetes')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [router])

  const censorCPF = (cpf: string) => {
    // Mostrar: 120***42
    if (!cpf || cpf.length < 5) return cpf
    return cpf.slice(0, 3) + '***' + cpf.slice(-2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">Carregando seus bilhetes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/meus-bilhetes"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-flex transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
            <div className="text-center">
              <p className="text-lg font-bold text-red-700 mb-4">{error}</p>
              <Link
                href="/meus-bilhetes"
                className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition"
              >
                Tentar Novamente
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/meus-bilhetes"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-flex transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 font-semibold">Nenhuma compra encontrada.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/meus-bilhetes"
          onClick={() => localStorage.removeItem('ticketQuery')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-flex transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <h1 className="text-3xl font-black mb-2">Meu Perfil</h1>
            <p className="text-emerald-100">Seus dados pessoais</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Nome Completo</p>
              <p className="text-lg font-bold text-gray-900">{censorName(ticketData.user.name)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Telefone</p>
              <p className="text-lg font-bold text-gray-900">{censorPhone(ticketData.user.phone)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">CPF</p>
              <p className="text-lg font-bold text-gray-900">{censorCPF(ticketData.user.cpf)}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-blue-700">
                ℹ️ Os dados acima aparecem parcialmente censurados por questões de segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              Minhas Compras
            </h2>
          </div>

          {ticketData.purchases.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 font-semibold">Você ainda não fez nenhuma compra.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ticketData.purchases.map((purchase) => {
                const handlePurchaseClick = () => {
                  // Armazenar dados da compra e origem em localStorage
                  localStorage.setItem(
                    `purchase_${purchase.id}`,
                    JSON.stringify({
                      purchase: {
                        ...purchase,
                        raffle: {
                          title: purchase.raffleTitle,
                          status: purchase.raffleStatus,
                        },
                      },
                      user: ticketData.user,
                      referrer: 'meus-bilhetes-resultado',
                    })
                  )
                }

                return (
                  <Link
                    key={purchase.id}
                    href={`/compra/${purchase.id}`}
                    onClick={handlePurchaseClick}
                  >
                    <div
                      className="p-6 hover:bg-emerald-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-emerald-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {purchase.raffleTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-emerald-600">
                            R$ {Number(purchase.amount).toFixed(2)}
                          </p>
                          <p className="text-xs font-bold text-gray-600 mt-1">
                            {purchase.livros} livros
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            purchase.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : purchase.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {purchase.status === 'confirmed' && '✅ Pagamento confirmado'}
                          {purchase.status === 'pending' && '⏳ Aguardando confirmação'}
                          {purchase.status !== 'confirmed' &&
                            purchase.status !== 'pending' &&
                            purchase.status}
                        </span>
                        <Eye className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Link
            href="/lotes"
            onClick={() => localStorage.removeItem('ticketQuery')}
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition text-center"
          >
            Voltar para Lotes
          </Link>
        </div>
      </div>
    </div>
  )
}
