'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Gift, Ticket, Trophy, Settings, Loader2, CheckCircle2, FileText, Plus, Minus, DollarSign, Package } from 'lucide-react'
import { censorName, formatDecimal } from '@/lib/formatters'
import { mainConfig } from '@/lib/layout-config'
import { RaffleImageGallery } from '@/components/lote-galeria-imagen'
import { CheckoutFlow } from '@/components/checkout-flow'
import { Drawer } from '@/components/drawer'
import { useAuth } from '@/context/auth-context'
import { AccordionItem } from '@/components/accordion'

interface RaffleDetail {
  id: string
  title: string
  description?: string | null
  prizeAmount?: number | string | null
  totalLivros: number
  soldLivros: number
  livroPrice: number | string
  status: string
  winner?: string | null
  winnerNumber?: string | null
  drawnNumber?: string | null
  winnerUser?: { name: string; email: string } | null
  premiosAleatorios?: string | any[] | null
  premiosConfig?: string | any[] | null
  purchases?: any[]
  image?: string | null
  images?: string[] | null
}

interface TopBuyer {
  id: string
  name: string
  email: string
  totalSpent: number
  totalLivros: number
  raffleBought: number
}

export default function RaffleDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const [raffle, setRaffle] = useState<RaffleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [buyers, setBuyers] = useState<TopBuyer[]>([])
  const [buyersLoading, setBuyersLoading] = useState(true)
  const [buyersError, setBuyersError] = useState<string | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminShowConfirm, setAdminShowConfirm] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSuccess, setAdminSuccess] = useState(false)

  // Presets para seleção de quantidade
  const presetOptions = [1, 50, 100, 200, 300, 500]

  useEffect(() => {
    let isMounted = true

    const fetchRaffle = async () => {
      try {
        setLoading(true)
        setError(null)
        setNotFound(false)

        const response = await fetch(`/api/lotes/${id}`, {
          credentials: 'include',
        })

        if (response.status === 404) {
          if (!isMounted) return
          setRaffle(null)
          setNotFound(true)
          return
        }

        if (!response.ok) {
          throw new Error('Erro ao buscar lote')
        }

        const data = (await response.json()) as RaffleDetail
        if (!isMounted) return
        setRaffle(data)
        setSelectedQuantity(1)
      } catch (err) {
        if (!isMounted) return
        console.error('Erro ao buscar lote:', err)
        setError('Erro ao carregar lote')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchRaffle()
    }

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    const fetchTopBuyers = async () => {
      try {
        setBuyersLoading(true)
        const response = await fetch(`/api/lotes/${id}/top-buyers`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setBuyers(data)
        } else {
          setBuyersError('Erro ao buscar compradores')
        }
      } catch (err) {
        console.error('Erro ao buscar top compradores do lote:', err)
        setBuyersError('Erro ao buscar dados')
      } finally {
        setBuyersLoading(false)
      }
    }

    if (id) {
      fetchTopBuyers()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-fundo-cinza flex flex-col items-center justify-center">
        <div className="text-center text-cinza-escuro font-semibold">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fundo-cinza flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-cinza-escuro">Falha ao carregar o lote</h1>
          <p className="text-cinza-escuro mb-4">{error}</p>
          <a href="/" className="text-azul-claro hover:text-azul-royal font-semibold">
            ← Voltar para lotes
          </a>
        </div>
      </div>
    )
  }

  if (!raffle || notFound) {
    return (
      <div className="min-h-screen bg-fundo-cinza flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-cinza-escuro">Lote não encontrada</h1>
          <a href="/" className="text-azul-claro hover:text-azul-royal font-semibold">
            ← Voltar para lotes
          </a>
        </div>
      </div>
    )
  }

  const progress = (raffle.soldLivros / raffle.totalLivros) * 100
  const isOpen = raffle.status === 'open'
  const availableLivros = raffle.totalLivros - raffle.soldLivros
  const totalPrice = selectedQuantity * Number(raffle.livroPrice)
  const images = Array.isArray(raffle.images) ? raffle.images : []
  const mainImage = typeof raffle.image === 'string' ? raffle.image : (images?.[0] || null)

  return (
    <main className={mainConfig}>
        <div className="flex items-center justify-between mb-5">
          <a href="/" className=" items-center gap-2 text-azul-royal text-1xl font-bold inline-flex transition">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Images */}
          <div className="w-full">
            {mainImage && (
              <RaffleImageGallery
                mainImage={mainImage}
                images={images}
                status={raffle.status}
              />
            )}
            
            {/* Top Compradores - desktop */}
            <div className="lg:block hidden mt-4">
              {buyersLoading ? (
                <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-amarelo-gold" />
                    <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                  </div>
                  <div className="text-center text-cinza-escuro">Carregando...</div>
                </div>
              ) : buyersError ? null : buyers.length === 0 ? (
                <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-amarelo-gold" />
                    <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                  </div>
                  <div className="text-center text-cinza-escuro py-8">
                    Nenhum comprador registrado ainda
                  </div>
                </div>
              ) : (
                <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-amarelo-gold" />
                    <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                  </div>

                  <div className="space-y-3">
                    {buyers.map((buyer, index) => (
                      <div
                        key={buyer.id}
                        className="flex items-center justify-between p-4 bg-cinza-claro  rounded-lg border border-cinza-claro hover:border-emerald-300 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-branco font-black text-lg">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && index + 1}
                          </div>
                          <div>
                            <div className="font-black text-sm text-cinza-escuro">{censorName(buyer.name)}</div>
                            <div className="text-1xl text-cinza">
                              {buyer.totalLivros} {buyer.totalLivros === 1 ? 'livro' : 'livros'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-lg text-cinza-escuro">
                            R$ {formatDecimal(buyer.totalSpent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
            <div className="mb-6">
              {raffle.status === 'drawn' && (
                <span className="inline-flex items-center gap-2 bg-amarelo-pastel text-amarelo-gold px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Trophy className="w-4 h-4" />
                  SORTEADO
                </span>
              )}
              {raffle.status === 'closed' && (
                <span className="inline-flex items-center gap-2 bg-vermelho-pastel text-vermelho-vivo px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <span>🔒</span>
                  FECHADO
                </span>
              )}
              {isOpen && (
                <span className="inline-flex items-center gap-2 bg-verde-pastel text-verde-agua px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Ticket className="w-4 h-4" />
                  ABERTO
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-black text-cinza-escuro mt-4">{raffle.title}</h1>
            </div>

            {raffle.description && (
              <p className="text-cinza-escuro mb-6 text-lg leading-relaxed">{raffle.description}</p>
            )}

            <div className="mb-8">
              <div className='flex mb-8 gap-5 flex-wrap'>
                <div className="bg-cinza-claro px-6 py-4 rounded-lg">
                  <div className="text-sm text-cinza font-semibold mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Livro
                  </div>
                  <div className="text-2xl font-black text-cinza">
                    R$ {formatDecimal(Number(raffle.livroPrice))}
                  </div>
                </div>

              {Number(raffle.prizeAmount) > 0 && (
                <div className="bg-amarelo-pastel px-6 py-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-cinza-escuro font-semibold mb-2">
                    <Gift className="w-4 h-4" />
                    Prêmio em Dinheiro
                  </div>
                  <div className="text-3xl font-black text-amarelo-gold">
                    R$ {formatDecimal(Number(raffle.prizeAmount))}
                  </div>
                </div>
              )}
              </div>

              

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-cinza-escuro">Progresso de Vendas</span>
                  <span className="text-sm font-bold text-azul-royal">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-cinza-claro rounded-full h-5 border border-gray-300 overflow-hidden">
                  <div
                    className="bg-azul-royal h-5 rounded-full    transition-all flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 10 && <span className="text-branco text-xs font-bold">{Math.round(progress)}%</span>}
                  </div>
                </div>
              </div>
              {/* vencedor */}
              {raffle.status === 'drawn' && raffle.winner && (
                <div className="bg-amarelo-pastel p-4 rounded-lg mt-4">
                  <div className="flex items-center gap-2 text-amarelo-gold font-bold mb-2">
                    <Trophy className="w-5 h-5" />
                    Resultado do Sorteio
                  </div>
                  {raffle.winnerNumber && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Número vencedor</p>
                      <p className="text-2xl font-mono font-black text-emerald-700">{raffle.winnerNumber}</p>
                      {raffle.drawnNumber && raffle.drawnNumber !== raffle.winnerNumber && (
                        <p className="text-xs text-gray-400 mt-1">Número sorteado: {raffle.drawnNumber}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Ganhador Principal</p>
                    <p className="text-lg font-black text-emerald-900">
                      {raffle.winnerUser?.name || 'Participante'}
                    </p>
                  </div>
                </div>
              )}

              {/* Prêmios Aleatórios — mostra com número sorteado (gerado na criação) */}
              {/* Depois do sorteio: mostra número, prêmio e ganhador */}
              {raffle.status === 'drawn' && raffle.premiosAleatorios && (() => {
                const premios = typeof raffle.premiosAleatorios === 'string' 
                  ? JSON.parse(raffle.premiosAleatorios) 
                  : raffle.premiosAleatorios
                if (!Array.isArray(premios) || premios.length === 0) return null
                return (
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <div className="flex items-center gap-2 text-purple-700 font-bold mb-3">
                      <Gift className="w-5 h-5" />
                      Prêmios Aleatórios ({premios.length})
                    </div>
                    <div className="space-y-2">
                      {premios.map((premio: any) => (
                        <div key={premio.posicao} className="bg-white rounded-lg p-3 border border-purple-200 flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                            {premio.posicao}º
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-mono font-bold text-gray-800">{premio.number}</p>
                              {premio.tipo === 'dinheiro' && premio.valor && (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                  <DollarSign className="w-3 h-3" />
                                  R$ {premio.valor}
                                </span>
                              )}
                              {premio.tipo === 'item' && premio.descricao && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                  <Package className="w-3 h-3" />
                                  {premio.descricao}
                                </span>
                              )}
                            </div>
                            {premio.drawnNumber && premio.drawnNumber !== premio.number && (
                              <p className="text-xs text-gray-400">Número sorteado: {premio.drawnNumber}</p>
                            )}
                            <p className="text-sm text-gray-600 truncate">{premio.winner?.name || 'Participante'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Antes do sorteio: mostra os prêmios configurados com o número já sorteado */}
              {raffle.status !== 'drawn' && raffle.premiosConfig && (() => {
                const config = typeof raffle.premiosConfig === 'string'
                  ? JSON.parse(raffle.premiosConfig)
                  : raffle.premiosConfig
                if (!Array.isArray(config) || config.length === 0) return null

                // Buscar dono de cada número de prêmio nas compras confirmadas
                const purchases = Array.isArray(raffle.purchases) ? raffle.purchases : []
                function findOwner(premioNumber: string) {
                  for (const p of purchases) {
                    if (p.status !== 'confirmed' || !p.numbers) continue
                    const nums = p.numbers.split(',').map((n: string) => n.trim())
                    if (nums.includes(premioNumber)) {
                      return p.user?.name || null
                    }
                  }
                  return null
                }

                return (
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                      <Gift className="w-5 h-5" />
                      Prêmios Aleatórios ({config.length})
                    </div>
                    <p className="text-xs text-purple-500 mb-3">Números já sorteados — ganhadores definidos ao cadastrar resultado</p>
                    <div className="space-y-2">
                      {config.map((premio: any, index: number) => {
                        const ownerName = findOwner(premio.number)
                        return (
                          <div key={index} className="bg-white rounded-lg p-3 border border-purple-200 flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                              {index + 1}º
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-mono font-bold text-2xl text-purple-700">{premio.number}</p>
                                {premio.tipo === 'dinheiro' && premio.valor && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    <DollarSign className="w-3 h-3" />
                                    R$ {premio.valor}
                                  </span>
                                )}
                                {premio.tipo === 'item' && premio.descricao && (
                                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    <Package className="w-3 h-3" />
                                    {premio.descricao}
                                  </span>
                                )}
                              </div>
                              {ownerName ? (
                                <p className="text-sm text-purple-700 font-semibold mt-1">🏆 {ownerName}</p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-1">Aguardando comprador</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>

            {isOpen && progress < 100 && (
              <>
                <div className="w-full mb-6">
                  <a href="/meus-bilhetes" className="block w-full bg-azul-royal text-branco hover:bg-branco hover:text-azul-royal border hover:border-azul-royal py-3 rounded-full font-bold text-center transition">
                    Meus Bilhetes
                  </a>
                </div>

                {/* Livro Selector */}
                <div className="bg-branco rounded-2xl">
                  <div className="space-y-3">
                    <p className="text-1xl md:text-2xl font-black text-cinza-escuro">Digite a quantidade:</p>
                    {availableLivros <= selectedQuantity && (
                      <p className="text-vermelho-vivo text-sm">Limite atingido</p>
                    )}
                    <div className="flex items-center gap-3 bg-fundo-cinza rounded-xl p-4 mb-4 border-2 border-cinza-claro">
                      <button
                        onClick={() => {
                          const newValue = Math.max(1, selectedQuantity - 1)
                          setSelectedQuantity(newValue)
                        }}
                        className="flex items-center justify-center w-12 h-12 bg-cinza hover:bg-vermelho-vivo text-branco rounded-lg font-black text-xl transition cursor-pointer"
                        title="Diminuir quantidade"
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={availableLivros}
                        value={selectedQuantity}
                        onChange={(e) => {
                          const raw = Number(e.target.value)
                          const clamped = Math.min(
                            Math.max(Number.isFinite(raw) ? raw : 1, 1),
                            availableLivros
                          )
                          setSelectedQuantity(clamped)
                        }}
                        className="flex-1 text-center text-2xl font-black text-cinza-escuro bg-transparent border-0 focus:outline-none"
                      />

                      <button
                        onClick={() => {
                          const newValue = Math.min(availableLivros, selectedQuantity + 1)
                          setSelectedQuantity(newValue)
                        }}
                        disabled={selectedQuantity >= availableLivros}
                        className="flex items-center justify-center w-12 h-12 bg-cinza hover:bg-azul-claro text-branco rounded-lg font-black text-xl transition cursor-pointer disabled:bg-cinza-claro disabled:cursor-not-allowed"
                        title="Aumentar quantidade"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-1xl md:text-2xl font-black text-cinza-escuro mb-6">Ou selecione abaixo:</h3>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {presetOptions.map((quantity) => {
                      const newTotal = selectedQuantity + quantity
                      const isDisabled = newTotal > availableLivros
                      return (
                        <button
                          key={quantity}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedQuantity(selectedQuantity + quantity)
                            }
                          }}
                          disabled={isDisabled}
                          className={`py-2 px-1 rounded-xl font-bold  text-lg transition transform ${
                            isDisabled
                              ? 'bg-cinza-claro text-cinza cursor-not-allowed'
                              : 'bg-branco text-azul-royal border-2 border-azul-royal hover:bg-azul-royal hover:text-branco  cursor-pointer hover:scale-105'
                          }`}
                        >
                          +{quantity}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-8 bg-amarelo-pastel p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-cinza-escuro font-semibold mb-1">Total a Pagar</p>
                      <p className="text-3xl font-black text-amarelo-gold">
                        R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    disabled={!isOpen}
                    className="w-full bg-amarelo-gold hover:bg-verde-claro cursor-pointer disabled:bg-cinza text-branco font-black text-lg py-4 rounded-full transition shadow-lg hover:bg-branco hover:text-amarelo-gold border hover:border-amarelo-gold disabled:border-cinza"
                  >
                    Comprar Agora
                  </button>
                  <p className="text-xs text-cinza text-center mt-4">
                    Clique e preencha o formulário ao lado
                  </p>
                </div>

                <Drawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  title="Finalizar Compra"
                >
                  <CheckoutFlow
                    raffleId={id}
                    livroPrice={Number(raffle.livroPrice)}
                    availableLivros={availableLivros}
                    isOpen={isOpen}
                    selectedQuantity={selectedQuantity}
                  />
                </Drawer>
              </>
            )}

            {progress >= 100 && isOpen && (
              <div className="w-full bg-azul-pastel text-azul-claro py-4 rounded-lg font-black text-center flex items-center justify-center gap-2">
                Todas os Livros Vendidas
              </div>
            )}

            {!isOpen && (
              <div className="w-full bg-cinza-claro text-cinza-escuro py-4 rounded-lg font-black text-center">
                Lote {raffle.status === 'drawn' ? 'Sorteado' : 'Fechado'}
              </div>
            )}

            {/* Ações de Admin */}
            {user?.isAdmin && (
              <div className="rounded-xl mt-6">
                <div className="flex items-center gap-2 text-vermelho-claro font-bold mb-4">
                  <Settings className="w-5 h-5" />
                  Ações de Administrador
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/admin/lotes/${id}/editar`}
                    className="flex-1 min-w-35 bg-branco border border-vermelho-claro hover:bg-vermelho-claro hover:text-branco text-vermelho-claro font-semibold py-2 px-4 rounded-full transition text-center"
                  >
                    Editar
                  </a>
                </div>

                {/* Finalizar Lote Section */}
                {raffle.status === 'open' && (
                  <div className="mt-6">
                    {!adminSuccess ? (
                      <>
                        {!adminShowConfirm ? (
                          <button
                            onClick={() => setAdminShowConfirm(true)}
                            className="w-full bg-vermelho-claro hover:bg-vermelho-vivo rounded-full cursor-pointer text-branco font-bold py-3 px-6 transition flex items-center justify-center gap-2"
                          >
                            Finalizar Lote
                          </button>
                        ) : (
                          <div className="bg-amarelo-pastel rounded-xl p-6">
                            <p className="text-vermelho-vivo font-semibold mb-4">
                              Tem certeza que deseja finalizar esta campanha?
                            </p>
                            <p className="text-vermelho-vivo text-sm mb-4">
                              Após finalizada, não será mais possível comprar livros nesta lote.
                            </p>
                            
                            {adminError && (
                              <p className="text-vermelho-vivo bg-vermelho-pastel px-4 py-2 rounded mb-4 text-sm">
                                {adminError}
                              </p>
                            )}

                            <div className="flex gap-3">
                              <button
                                onClick={async () => {
                                  setAdminLoading(true)
                                  setAdminError(null)

                                  try {
                                    const response = await fetch(`/api/admin/lotes/${id}/finalizar`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    })

                                    const data = await response.json()

                                    if (!response.ok) {
                                      throw new Error(data.error || 'Erro ao finalizar campanha')
                                    }

                                    setAdminSuccess(true)
                                    setAdminShowConfirm(false)
                                    
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 1500)
                                  } catch (err: any) {
                                    setAdminError(err.message)
                                  } finally {
                                    setAdminLoading(false)
                                  }
                                }}
                                disabled={adminLoading}
                                className="flex-1 bg-vermelho-claro rounded-full cursor-pointer hover:bg-vermelho-vivo disabled:bg-vermelho-claro text-branco font-bold py-3 px-4 transition flex items-center justify-center gap-2"
                              >
                                {adminLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4  animate-spin" />
                                    Finalizando...
                                  </>
                                ) : (
                                  'Sim, Finalizar'
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setAdminShowConfirm(false)
                                  setAdminError(null)
                                }}
                                disabled={adminLoading}
                                className="flex-1 bg-cinza-claro hover:bg-cinza-escuro hover:text-branco cursor-pointer text-cinza font-bold py-3 px-4 rounded-full transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        Campanha finalizada com sucesso!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Compradores - mobile*/}
          <div className="lg:hidden block mt-8">
            {buyersLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-cinza-claro">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-amarelo-gold" />
                  <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                </div>
                <div className="text-center text-gray-600">Carregando...</div>
              </div>
            ) : buyersError ? null : buyers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-cinza-claro">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-amarelo-gold" />
                  <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                </div>
                <div className="text-center text-gray-600 py-8">
                  Nenhum comprador registrado ainda
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-cinza-claro">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-amarelo-gold" />
                  <h2 className="text-2xl font-black text-cinza-escuro">Top Compradores</h2>
                </div>

                <div className="space-y-3">
                  {buyers.map((buyer, index) => (
                    <div
                      key={buyer.id}
                      className="flex items-center justify-between p-4 bg-cinza-claro  rounded-lg border border-cinza-claro100 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-branco font-black text-lg">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && index + 1}
                        </div>
                        <div>
                          <div className="font-black text-sm text-cinza-escuro">{censorName(buyer.name)}</div>
                          <div className="text-1xl text-cinza">
                            {buyer.totalLivros} {buyer.totalLivros === 1 ? 'livro' : 'livros'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-lg text-cinza-escuro">
                          R$ {formatDecimal(buyer.totalSpent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
 
        {/* Disclaimer */}
        <div className="mt-12 bg-fundo-cinza rounded-2xl shadow-lg p-8 border border-cinza-claro">
          <div className="space-y-4 text-sm text-cinza leading-relaxed">
            <p className="font-bold text-cinza-escuro ">Informações Importantes</p>
            <p>
              Este bilhete de loteria está autorizado com base no termo de autorização descrito no regulamento da promoção. Antes de contratar, consulte o Regulamento do produto. É proibida a venda para menores de 18 anos.
            </p>
            <p>
              Os sorteios e entrega dos prêmios serão realizados de acordo com os critérios estabelecidos neste site, nos termos seguintes: O adquirente concorrerá em todos os sorteios previstos no bilhete digital emitido, mesmo sendo contemplado em alguns deles.
            </p>
            <p>
              Ao contribuir, o titular do BILHETE Digital concorda desde já e sem ônus a utilização de seu nome, sua voz e imagem para a divulgação desta lote social.
            </p>
          </div>
        </div>

        {/* Regulamento */}
        <div className="mt-16 bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
      <h2 className="text-2xl font-black text-cinza mb-6 flex items-center gap-2">
        Regulamento
      </h2>

      <div className="space-y-4">
        <AccordionItem title="Termos e Condições">
          <div className="text-cinza leading-relaxed space-y-3">
            <p>
              Esta lote é organizada de acordo com os regulamentos da Lei nº 9.504/1997 e da Resolução do Tribunal Superior Eleitoral (TSE). 
              Todos os participantes devem aceitar os Termos e Condições da plataforma Tronco da Sorte.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Responsabilidade Legal">
          <div className="text-cinza leading-relaxed space-y-3">
            <p className="font-semibold">O organizador desta lote é responsável por:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Manter registros completos de todas as transações</li>
              <li>Realizar o sorteio de forma justa e transparente</li>
              <li>Cumprir todas as obrigações legais e fiscais</li>
              <li>Proteger os dados pessoais dos participantes</li>
              <li>Entregar o prêmio ao vencedor conforme regulamentado</li>
            </ul>
          </div>
        </AccordionItem>

        <AccordionItem title="Transparência e Sorteio">
          <div className="text-cinza leading-relaxed space-y-3">
            <p className="font-semibold">O sorteio será realizado de forma pública e auditável. Todos os participantes serão notificados sobre:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Data e horário exato do sorteio</li>
              <li>Método de seleção do vencedor</li>
              <li>Resultado do sorteio em tempo real</li>
              <li>Dados do vencedor (apenas primeira letra do nome)</li>
            </ul>
          </div>
        </AccordionItem>

        <div className="bg-azul-pastel rounded-lg p-4 mt-4">
          <p className="text-sm text-azul-royal font-semibold">
            <strong>Aviso Legal:</strong> A participação nesta lote constitui aceitação automática de todos os termos, 
            condições e regulamentos estabelecidos. Para mais informações, consulte a{' '}
            <a href="/termos" className="text-azul-claro hover:text-azul-royal font-bold">
              Política de Termos
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-azul-claro hover:text-azul-royal font-bold">
              Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
    </main>
  )
}
