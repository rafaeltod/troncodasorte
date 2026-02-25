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
      <div className="min-h-screen bg-cinza-claro dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-center">
          <p className="text-cinza dark:text-cinza-claro font-semibold">Carregando seus bilhetes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cinza-claro">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
          <a href="/" className=" items-center gap-2 text-azul-royal text-1xl font-bold inline-flex transition">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </a>
        </div>

          <div className="bg-branco rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <p className="text-lg font-bold text-vermelho-vivo mb-4">{error}</p>
              <Link
                href="/meus-bilhetes"
                className="inline-block bg-azul-royal text-branco px-6 py-2 rounded-lg font-bold hover:bg-branco hover:text-azul-royal transition"
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
      <div className="min-h-screen bg-cinza-claro">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <a href="/meus-bilhetes" className=" items-center gap-2 text-azul-royal text-1xl font-bold inline-flex transition">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </a>

          <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza">
            <div className="text-center">
              <p className="text-gray-600 font-semibold">Nenhuma compra encontrada.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cinza-claro">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/meus-bilhetes"
          onClick={() => localStorage.removeItem('ticketQuery')}
          className=" items-center gap-2 text-azul-royal text-1xl font-bold inline-flex transition mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* User Info */}
        <div className="bg-branco rounded-2xl shadow-lg border border-cinza mb-6 overflow-hidden">
          <div className="bg-azul-royal text-branco p-6">
            <h1 className="text-3xl font-black mb-2">Meu Perfil</h1>
            <p className="text-emerald-100">Seus dados pessoais</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-cinza mb-1">Nome Completo</p>
              <p className="text-lg font-bold text-cinza-escuro">{censorName(ticketData.user.name)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-cinza mb-1">Email</p>
              <p className="text-lg font-bold text-cinza-escuro">{censorEmail(ticketData.user.email)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-cinza mb-1">Telefone</p>
              <p className="text-lg font-bold text-cinza-escuro">{censorPhoneShort(ticketData.user.phone)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-cinza mb-1">CPF</p>
              <p className="text-lg font-bold text-cinza-escuro">{censorCPF(ticketData.user.cpf)}</p>
            </div>

            <div className="bg-azul-pastel border rounded-lg p-4 mt-4">
              <p className="text-xs text-azul-royal">
              Os dados acima aparecem parcialmente censurados por questões de segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className="space-y-4">
          <div className="bg-branco rounded-2xl shadow-lg border border-cinza overflow-hidden mb-4">
            <div className="bg-azul-royal text-branco p-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Minhas Compras por Lote
              </h2>
            </div>
          </div>

          {ticketData.purchases.length === 0 ? (
            <div className="bg-branco rounded-2xl shadow-lg border border-cinza p-6 text-center">
              <p className="text-gray-600 font-semibold">Você ainda não fez nenhuma compra.</p>
            </div>
          ) : (
            groupPurchasesByRaffle(ticketData.purchases).map((raffleGroup) => (
              <div key={raffleGroup.raffleId} className="bg-branco rounded-2xl shadow-lg border border-cinza overflow-hidden">
                {/* Raffle Header */}
                <button
                  onClick={() => toggleRaffleExpanded(raffleGroup.raffleId)}
                  className="w-full p-4 hover:bg-cinza-claro transition-colors flex items-center gap-4 cursor-pointer"
                >
                  {/* Mini Image */}
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-cinza relative">
                    {raffleGroup.raffleImage ? (
                      <Image
                        src={raffleGroup.raffleImage}
                        alt={raffleGroup.raffleTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Ticket className="w-8 h-8 text-cinza" />
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
                  <div className="shrink-0 flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full brancospace-nowrap ${
                        raffleGroup.raffleStatus === 'drawn'
                          ? 'bg-amarelo-pastel text-amarelo-gold'
                          : raffleGroup.raffleStatus === 'open'
                          ? 'bg-verde-pastel text-verde-menta'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {raffleGroup.raffleStatus === 'drawn'
                        ? 'Sorteada'
                        : raffleGroup.raffleStatus === 'open'
                        ? 'Aberta'
                        : 'Fechada'}
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
                  <div className="border-t border-cinza p-4">
                    {/* Summary */}
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <p className="text-xs text-cinza font-semibold">TOTAL GASTO</p>
                          <p className="text-xl font-black text-cinza">
                            R$ {formatDecimal(raffleGroup.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-cinza font-semibold">LIVROS</p>
                          <p className="text-xl font-black text-cinza">
                            {raffleGroup.totalLivros}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-cinza font-semibold">NÚMEROS</p>
                          <p className="text-xl font-black text-cinza">
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
                          className={`flex-1 px-3 py-2 font-bold rounded-full text-sm transition cursor-pointer border-2 ${
                            selectedRaffleNumbers === raffleGroup.raffleId
                              ? 'bg-azul-royal text-branco border-azul-royal'
                              : 'bg-branco text-azul-royal border-azul-royal hover:bg-azul-royal/50'
                          }`}
                        >
                          Ver Números
                        </button>
                        <button
                          onClick={() =>
                            setSelectedRaffleProofs(
                              selectedRaffleProofs === raffleGroup.raffleId
                                ? null
                                : raffleGroup.raffleId
                            )
                          }
                          className={`flex-1 px-3 py-2 font-bold rounded-full text-sm transition cursor-pointer border-2 ${
                            selectedRaffleProofs === raffleGroup.raffleId
                              ? 'bg-azul-royal text-branco border-azul-royal'
                              : 'bg-branco text-azul-royal border-azul-royal hover:bg-azul-royal/50'
                          }`}
                        >
                          Ver Comprovantes
                        </button>
                      </div>
                    </div>

                    {/* Numbers Modal */}
                    {selectedRaffleNumbers === raffleGroup.raffleId && (
                      <div className="bg-fundo-cinza border-l-4 border-azul-royal rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-cinza-escuro">Seus Números</h4>
                          <button
                            onClick={() => setSelectedRaffleNumbers(null)}
                            className="text-cinza  hover:text-cinza-escuro  cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {raffleGroup.allNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="bg-azul-royal text-branco px-3 py-1 rounded-full text-sm font-bold"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proofs Modal */}
                    {selectedRaffleProofs === raffleGroup.raffleId && (
                      <div className="bg-fundo-cinza border-l-4 border-azul-royal rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-cinza-escuro">Comprovantes ({raffleGroup.purchases.length})</h4>
                          <button
                            onClick={() => setSelectedRaffleProofs(null)}
                            className="text-cinza  hover:text-cinza-escuro  cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {raffleGroup.purchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="bg-branco rounded p-3 border border-cinza-claro text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-cinza-escuro">
                                    {purchase.livros} livro{purchase.livros !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-xs text-cinza">
                                    {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <p className="font-black text-cinza">
                                  R$ {formatDecimal(Number(purchase.amount))}
                                </p>
                              </div>
                              <p className="text-xs text-cinza mt-1 font-mono">ID: {purchase.id}</p>
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
            className="block w-full bg-azul-royal text-branco hover:bg-branco hover:text-azul-royal  border-2 border-azul-royal py-3 rounded-full font-bold transition text-center"
          >
            Voltar para Lotes
          </Link>
        </div>
      </div>
    </div>
  )
}
