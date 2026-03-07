'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  livros: number
  amount: number
  status: string
  createdAt: string
  isAnonymous?: boolean
}

export default function HistoricoPage() {
  const router = useRouter()
  const params = useParams()
  const cliente = typeof params?.cliente === 'string' ? params.cliente : ''
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
    return (
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-cinza dark:text-cinza-claro font-semibold">Carregando...</div>
      </div>
    )
  }

  // Se não há usuário e nenhuma compra anônima salva
  if (!user && purchases.length === 0) {
    return (
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-cinza-escuro dark:text-cinza-claro mb-4">
            Histórico de Compras
          </h1>
          <p className="text-cinza dark:text-gray-400 text-lg mb-8">
            Você não tem nenhuma compra salva. Faça uma compra ou{" "}
            <Link href="/auth/login" className="text-azul-royal dark:text-azul-claro font-bold">
              faça login
            </Link>{" "}
            para ver seu histórico.
          </p>
          <Link
            href={`/${cliente}`}
              className="inline-block bg-azul-royal dark:bg-azul-claro text-branco px-8 py-3 rounded-full font-bold hover:bg-branco dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal border transition"
          >
            Explorar Lotes
          </Link>
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-cinza-escuro dark:text-cinza-claro mb-4">
            Histórico de Compras
          </h1>
          <p className="text-cinza dark:text-gray-400 text-lg mb-8">
            Você ainda não comprou nenhuma cota
          </p>
          <Link
            href={`/${cliente}`}
            className="inline-block bg-azul-royal dark:bg-azul-claro text-branco px-8 py-3 rounded-full font-bold hover:bg-branco dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal border transition"
          >
            Explorar Lotes
          </Link>
        </div>
      </div>
    );
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalLivros = purchases.reduce((acc, p) => acc + p.livros, 0)

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black text-cinza-escuro dark:text-cinza-claro mb-2">
          <History className="inline mr-2" size={40} />
          Histórico de Compras
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-azul-royal dark:bg-azul-claro/20 rounded-lg shadow-lg p-4 text-branco dark:text-azul-claro border dark:border-azul-claro/30">
            <p className="text-azul-pastel dark:text-azul-claro/70 text-sm font-semibold">
              Total Gasto
            </p>
            <p className="text-2xl font-black mt-1">
              R$ {Number(totalSpent).toFixed(2)}
            </p>
          </div>
          <div className="bg-azul-royal dark:bg-azul-claro/20 rounded-lg shadow-lg p-4 text-branco dark:text-azul-claro border dark:border-azul-claro/30">
            <p className="text-azul-pastel dark:text-azul-claro/70 text-sm font-semibold">Livros</p>
            <p className="text-2xl font-black mt-1">{totalLivros}</p>
          </div>
          <div className="bg-azul-royal dark:bg-azul-claro/20 rounded-lg shadow-lg p-4 text-branco dark:text-azul-claro border dark:border-azul-claro/30">
            <p className="text-azul-pastel dark:text-azul-claro/70 text-sm font-semibold">Participações</p>
            <p className="text-2xl font-black mt-1">{purchases.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Link key={purchase.id} href={`/${cliente}/lotes/${purchase.raffleId}`}>
              <div className="bg-branco dark:bg-[#232F3E] rounded-xl shadow-md hover:shadow-lg p-6 border border-cinza-claro dark:border-gray-700 cursor-pointer transition transform hover:scale-102">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-black text-cinza-escuro dark:text-cinza-claro text-lg">
                      {purchase.raffle?.title || "Rifa"}
                    </h3>
                    <p className="text-cinza dark:text-gray-400 text-sm mt-1">
                      {purchase.livros} cota{purchase.livros !== 1 ? "s" : ""} •{" "}
                      {new Date(purchase.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-azul-royal dark:text-azul-claro">
                      R$ {Number(purchase.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        purchase.status === "confirmed"
                          ? "bg-azul-pastel text-azul-royal dark:bg-azul-claro/20 dark:text-azul-claro"
                          : "bg-cinza-claro text-cinza-escuro dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {purchase.status === "confirmed"
                        ? "Pagamento Confirmado"
                        : "Aguardando Pagamento"}
                    </span>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        purchase.raffle?.status === "drawn"
                          ? "bg-azul-pastel text-azul-royal dark:bg-azul-claro/20 dark:text-azul-claro"
                          : purchase.raffle?.status === "open"
                            ? "bg-azul-pastel text-azul-royal dark:bg-azul-claro/20 dark:text-azul-claro"
                            : "bg-cinza-claro text-cinza-escuro dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {purchase.raffle?.status === "drawn"
                        ? "Sorteada"
                        : purchase.raffle?.status === "open"
                          ? "Aberta"
                          : "Fechada"}
                    </span>

                    {purchase.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedPurchaseId(purchase.id);
                          setSelectedRaffleId(purchase.raffleId);
                          setSelectedPurchaseAmount(purchase.amount);
                          setShowPixModal(true);
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-azul-pastel text-azul-royal dark:bg-azul-claro/20 dark:text-azul-claro hover:bg-azul-royal hover:text-branco dark:hover:bg-azul-claro dark:hover:text-azul-royal transition"
                      >
                        Ver/Pagar PIX
                      </button>
                    )}

                    {purchase.status === "pending" && purchase.isAnonymous && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const response = await fetch(
                              "/api/payment/webhook-sim",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  purchaseId: purchase.id,
                                  raffleId: purchase.raffleId,
                                  action: "confirm_one",
                                }),
                              },
                            );
                            if (response.ok) {
                              // Atualizar compra localmente
                              setPurchases((prev) =>
                                prev.map((p) =>
                                  p.id === purchase.id
                                    ? { ...p, status: "confirmed" }
                                    : p,
                                ),
                              );
                            }
                          } catch (err) {
                            console.error("Erro ao confirmar:", err);
                          }
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-azul-pastel text-azul-royal dark:bg-azul-claro/20 dark:text-azul-claro hover:bg-azul-royal hover:text-branco dark:hover:bg-azul-claro dark:hover:text-azul-royal transition"
                      >
                        Já Paguei
                      </button>
                    )}
                  </div>

                  {purchase.raffle?.status === "drawn" &&
                    purchase.raffle?.winner && (
                      <span className="text-sm text-amarelo-gold dark:text-yellow-400 font-black brancospace-nowrap">
                        Você ganhou!
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
            setShowPixModal(false);
            setSelectedPurchaseId(null);
            setSelectedRaffleId(null);
          }}
          purchaseId={selectedPurchaseId || ""}
          amount={selectedPurchaseAmount}
          raffleId={selectedRaffleId || ""}
          onPaymentConfirmed={() => {
            setShowPixModal(false);
            setSelectedPurchaseId(null);
            setSelectedRaffleId(null);
            // Recarregar compras
            setPurchases((prev) =>
              prev.map((p) =>
                p.id === selectedPurchaseId ? { ...p, status: "confirmed" } : p,
              ),
            );
          }}
        />
      </div>
    </div>
  );
}
