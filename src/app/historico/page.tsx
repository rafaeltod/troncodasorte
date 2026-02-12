'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { PixPaymentModal } from '@/components/pix-payment-modal'
import { History, TrendingUp, ShoppingCart } from 'lucide-react'

interface Purchase {
  id: string
  raffleId: string
  raffle?: {
    title: string
    status: string
    winner: string | null
  }
  quotas: number
  amount: number
  status: string
  createdAt: string
  isAnonymous?: boolean
}

export default function HistoricoPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [showPixModal, setShowPixModal] = useState(false)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null)
  const [selectedPurchaseAmount, setSelectedPurchaseAmount] = useState(0)
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null)

  useEffect(() => {
    // Carregar compras (autenticadas ou anônimas)
    const loadPurchases = async () => {
      try {
        let allPurchases: Purchase[] = []

        // Se logado, buscar compras autenticadas
        if (user) {
          const response = await fetch(`/api/users/${user.id}/purchases`, {
            credentials: 'include',
          })
          if (response.ok) {
            const data = await response.json()
            allPurchases = data
          }
        } else {
          // Se não logado, buscar compras anônimas do localStorage
          const anonymousPurchases = JSON.parse(localStorage.getItem('anonymousPurchases') || '[]')
          allPurchases = anonymousPurchases.map((p: any) => ({
            ...p,
            isAnonymous: true,
            raffle: { title: 'Rifa Desconhecida', status: 'unknown', winner: null }, // Placeholder
          }))
        }

        setPurchases(allPurchases)
      } catch (err) {
        console.error('Erro ao buscar compras:', err)
        setPurchases([])
      } finally {
        setPageLoading(false)
      }
    }

    if (loading) return
    loadPurchases()
  }, [user, loading])

  // Se ainda está carregando auth
  if (loading || pageLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  // Se não há usuário e nenhuma compra anônima salva
  if (!user && purchases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            <History className="inline mr-2" size={40} />
            Histórico de Compras
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Você não tem nenhuma compra salva. Faça uma compra ou <Link href="/auth/login" className="text-emerald-600 font-bold">faça login</Link> para ver seu histórico.
          </p>
          <Link
            href="/campanhas"
            className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Explorar Campanhas 🎯
          </Link>
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-4"><History className="inline mr-2" size={40} />Histórico de Compras</h1>
          <p className="text-gray-600 text-lg mb-8">
            Você ainda não comprou nenhuma cota
          </p>
          <Link
            href="/campanhas"
            className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Explorar Campanhas 🎯
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalQuotas = purchases.reduce((acc, p) => acc + p.quotas, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black text-gray-900 mb-2"><History className="inline mr-2" size={40} />Histórico de Compras</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-emerald-100 text-sm font-semibold">Total Gasto</p>
            <p className="text-2xl font-black mt-1">R$ {Number(totalSpent).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-teal-100 text-sm font-semibold">Cotas</p>
            <p className="text-2xl font-black mt-1">{totalQuotas}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-cyan-100 text-sm font-semibold">Participações</p>
            <p className="text-2xl font-black mt-1">{purchases.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Link key={purchase.id} href={`/campanhas/${purchase.raffleId}`}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-200 cursor-pointer transition transform hover:scale-102">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-lg">{purchase.raffle?.title || 'Rifa'}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {purchase.quotas} cota{purchase.quotas !== 1 ? 's' : ''} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600">
                      R$ {Number(purchase.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        purchase.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {purchase.status === 'confirmed'
                        ? '✅ Pagamento Confirmado'
                        : '⏳ Aguardando Pagamento'}
                    </span>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        purchase.raffle?.status === 'drawn'
                          ? 'bg-emerald-100 text-emerald-800'
                          : purchase.raffle?.status === 'open'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {purchase.raffle?.status === 'drawn'
                        ? '✅ Sorteada'
                        : purchase.raffle?.status === 'open'
                          ? '🔄 Aberta'
                          : '⏸️ Fechada'}
                    </span>

                    {purchase.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedPurchaseId(purchase.id)
                          setSelectedRaffleId(purchase.raffleId)
                          setSelectedPurchaseAmount(purchase.amount)
                          setShowPixModal(true)
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                      >
                        📱 Ver/Pagar PIX
                      </button>
                    )}

                    {purchase.status === 'pending' && purchase.isAnonymous && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault()
                          try {
                            const response = await fetch('/api/payment/webhook-sim', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                purchaseId: purchase.id,
                                raffleId: purchase.raffleId,
                                action: 'confirm_one',
                              }),
                            })
                            if (response.ok) {
                              // Atualizar compra localmente
                              setPurchases(prev =>
                                prev.map(p =>
                                  p.id === purchase.id ? { ...p, status: 'confirmed' } : p
                                )
                              )
                            }
                          } catch (err) {
                            console.error('Erro ao confirmar:', err)
                          }
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                      >
                        ✅ Já Paguei
                      </button>
                    )}
                  </div>

                  {purchase.raffle?.status === 'drawn' && purchase.raffle?.winner && (
                    <span className="text-sm text-emerald-600 font-black whitespace-nowrap">
                      🏆 Você ganhou!
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* PIX Payment Modal */}
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => {
            setShowPixModal(false)
            setSelectedPurchaseId(null)
            setSelectedRaffleId(null)
          }}
          purchaseId={selectedPurchaseId || ''}
          amount={selectedPurchaseAmount}
          raffleId={selectedRaffleId || ''}
          onPaymentConfirmed={() => {
            setShowPixModal(false)
            setSelectedPurchaseId(null)
            setSelectedRaffleId(null)
            // Recarregar compras
            setPurchases(prev =>
              prev.map(p =>
                p.id === selectedPurchaseId ? { ...p, status: 'confirmed' } : p
              )
            )
          }}
        />
      </div>
    </div>
  )
}
