'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Ticket, Eye, ChevronDown, X } from 'lucide-react'
import { censorName, censorPhoneShort, censorEmail, formatDecimal } from '@/lib/formatters'

interface Purchase {
  id: string
  raffleId: string
  livros: number
  amount: number
  status: string
  createdAt: string
  raffleTitle: string
  raffleStatus: string
  raffleImage: string
  numbers: string[] | string
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

// Interface para agrupar compras por lote
interface RaffleGroup {
  raffleId: string
  raffleTitle: string
  raffleStatus: string
  raffleImage: string
  purchases: Purchase[]
  totalSpent: number
  totalLivros: number
  allNumbers: string[]
}

export default function TicketsResultPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [expandedRaffles, setExpandedRaffles] = useState<Set<string>>(new Set())
  const [selectedRaffleNumbers, setSelectedRaffleNumbers] = useState<string | null>(null)
  const [selectedRaffleProofs, setSelectedRaffleProofs] = useState<string | null>(null)

  // Agrupar compras por lote com totalizações
  const groupPurchasesByRaffle = (purchases: Purchase[]): RaffleGroup[] => {
    const groups: { [key: string]: RaffleGroup } = {}

    purchases.forEach(purchase => {
      if (!groups[purchase.raffleId]) {
        groups[purchase.raffleId] = {
          raffleId: purchase.raffleId,
          raffleTitle: purchase.raffleTitle,
          raffleStatus: purchase.raffleStatus,
          raffleImage: purchase.raffleImage,
          purchases: [],
          totalSpent: 0,
          totalLivros: 0,
          allNumbers: [],
        }
      }
      groups[purchase.raffleId].purchases.push(purchase)
      groups[purchase.raffleId].totalSpent += Number(purchase.amount)
      groups[purchase.raffleId].totalLivros += purchase.livros
      // Consolidar números
      if (purchase.numbers && Array.isArray(purchase.numbers)) {
        groups[purchase.raffleId].allNumbers.push(...purchase.numbers)
      } else if (typeof purchase.numbers === 'string' && purchase.numbers) {
        groups[purchase.raffleId].allNumbers.push(...purchase.numbers.split(',').filter(Boolean))
      }
    })

    return Object.values(groups)
  }

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
        // Inicializar com primeiro lote expandido se houver compras
        if (data.purchases && data.purchases.length > 0) {
          const firstRaffleId = data.purchases[0].raffleId
          setExpandedRaffles(new Set([firstRaffleId]))
        }
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

  const toggleRaffleExpanded = (raffleId: string) => {
    setExpandedRaffles(prev => {
      const updated = new Set(prev)
      if (updated.has(raffleId)) {
        updated.delete(raffleId)
      } else {
        updated.add(raffleId)
      }
      return updated
    })
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
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-6">
            <h1 className="text-3xl font-black mb-2">Meu Perfil</h1>
            <p className="text-emerald-100">Seus dados pessoais</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Nome Completo</p>
              <p className="text-lg font-bold text-gray-900">{censorName(ticketData.user.name)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Email</p>
              <p className="text-lg font-bold text-gray-900">{censorEmail(ticketData.user.email)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Telefone</p>
              <p className="text-lg font-bold text-gray-900">{censorPhoneShort(ticketData.user.phone)}</p>
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
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-4">
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Minhas Compras por Lote
              </h2>
            </div>
          </div>

          {ticketData.purchases.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-600 font-semibold">Você ainda não fez nenhuma compra.</p>
            </div>
          ) : (
            groupPurchasesByRaffle(ticketData.purchases).map((raffleGroup) => (
              <div key={raffleGroup.raffleId} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Raffle Header */}
                <button
                  onClick={() => toggleRaffleExpanded(raffleGroup.raffleId)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 cursor-pointer"
                >
                  {/* Mini Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200 relative">
                    {raffleGroup.raffleImage ? (
                      <Image
                        src={raffleGroup.raffleImage}
                        alt={raffleGroup.raffleTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Ticket className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Raffle Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {raffleGroup.raffleTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {raffleGroup.purchases.length} compra{raffleGroup.purchases.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        raffleGroup.raffleStatus === 'drawn'
                          ? 'bg-emerald-100 text-emerald-800'
                          : raffleGroup.raffleStatus === 'open'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {raffleGroup.raffleStatus === 'drawn'
                        ? '✅ Sorteada'
                        : raffleGroup.raffleStatus === 'open'
                        ? '🔄 Aberta'
                        : '⏸️ Fechada'}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedRaffles.has(raffleGroup.raffleId) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Purchases List */}
                {expandedRaffles.has(raffleGroup.raffleId) && (
                  <div className="border-t border-gray-200 p-4">
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">TOTAL GASTO</p>
                          <p className="text-xl font-black text-emerald-600">
                            R$ {formatDecimal(raffleGroup.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">LIVROS</p>
                          <p className="text-xl font-black text-teal-600">
                            {raffleGroup.totalLivros}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">NÚMEROS</p>
                          <p className="text-xl font-black text-cyan-600">
                            {raffleGroup.allNumbers.length}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedRaffleNumbers(
                              selectedRaffleNumbers === raffleGroup.raffleId
                                ? null
                                : raffleGroup.raffleId
                            )
                          }
                          className="flex-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 px-3 py-2 rounded font-bold text-sm transition"
                        >
                          👁️ Ver Números
                        </button>
                        <button
                          onClick={() =>
                            setSelectedRaffleProofs(
                              selectedRaffleProofs === raffleGroup.raffleId
                                ? null
                                : raffleGroup.raffleId
                            )
                          }
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded font-bold text-sm transition"
                        >
                          📋 Ver Comprovantes
                        </button>
                      </div>
                    </div>

                    {/* Numbers Modal */}
                    {selectedRaffleNumbers === raffleGroup.raffleId && (
                      <div className="bg-cyan-50 border-l-4 border-cyan-600 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-cyan-900">Seus Números</h4>
                          <button
                            onClick={() => setSelectedRaffleNumbers(null)}
                            className="text-cyan-600 hover:text-cyan-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {raffleGroup.allNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="bg-cyan-200 text-cyan-900 px-3 py-1 rounded-full text-sm font-bold"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proofs Modal */}
                    {selectedRaffleProofs === raffleGroup.raffleId && (
                      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-blue-900">Comprovantes ({raffleGroup.purchases.length})</h4>
                          <button
                            onClick={() => setSelectedRaffleProofs(null)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {raffleGroup.purchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="bg-white rounded p-3 border border-blue-200 text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {purchase.livros} livro{purchase.livros !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <p className="font-black text-emerald-600">
                                  R$ {formatDecimal(Number(purchase.amount))}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 font-mono">ID: {purchase.id}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
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
