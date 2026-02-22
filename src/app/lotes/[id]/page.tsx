'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Gift, Ticket, Trophy } from 'lucide-react'
import { censorName, formatDecimal } from '@/lib/formatters'
import { mainConfig } from '@/lib/layout-config'
import { RaffleRegulation } from '@/components/lote-regulamentação'
import { RaffleImageGallery } from '@/components/lote-galeria-imagen'
import { AdminLoteActions } from '@/components/admin-lote-actions'
import { CheckoutFlow } from '@/components/checkout-flow'
import { Drawer } from '@/components/drawer'

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
  image?: string | null
  images?: string[] | null
}

interface LivroSelectorProps {
  onSelect: (quantity: number) => void
  selectedQuantity: number
  availableLivros: number
}

function LivroSelector({ onSelect, selectedQuantity, availableLivros }: LivroSelectorProps) {
  const presetOptions = [1, 50, 100, 200, 300, 500]

  const handleAddQuantity = (quantity: number) => {
    const newTotal = selectedQuantity + quantity
    if (newTotal <= availableLivros) {
      onSelect(newTotal)
    }
  }

  return (
    <div className="bg-branco rounded-2xl">
      <h3 className="text-1xl md:text-2xl font-black text-cinza-escuro mb-6">Selecione a quantidade</h3>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {presetOptions.map((quantity) => {
          const newTotal = selectedQuantity + quantity
          const isDisabled = newTotal > availableLivros
          return (
            <button
              key={quantity}
              onClick={() => !isDisabled && handleAddQuantity(quantity)}
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

      <div className="space-y-3">
        <p className="text-1xl md:text-2xl font-bold text-cinza-escuro">Ou digite abaixo:</p>
        {availableLivros <= selectedQuantity && (
          <p className="text-vermelho-vivo text-sm">Limite atingido</p>
        )}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
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
              onSelect(clamped)
            }}
            className="flex-1 text-center text-2xl font-black text-cinza-escuro bg-transparent border-0 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}


{}
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

function RaffleTopBuyers({ raffleId }: RaffleTopBuyersProps) {
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
            className="flex items-center justify-between p-4 bg-cinza-claro rounded-lg border border-gray-100 hover:border-emerald-300 transition"
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
  )
}

export default function RaffleDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const [raffle, setRaffle] = useState<RaffleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center text-cinza-escuro font-semibold">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-cinza-escuro">Falha ao carregar o lote</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/" className="text-azul-claro hover:text-azul-royal font-semibold">
            ← Voltar para lotes
          </a>
        </div>
      </div>
    )
  }

  if (!raffle || notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
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
              <RaffleTopBuyers raffleId={id} />
            </div>
          </div>

          {/* Info */}
          <div className="bg-branco rounded-2xl shadow-lg p-8 border border-gray-200">
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
              <div className='flex mb-8 gap-5'>
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
                <div className="w-full bg-gray-200 rounded-full h-5 border border-gray-300 overflow-hidden">
                  <div
                    className="bg-azul-royal h-5 rounded-full    transition-all flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 10 && <span className="text-branco text-xs font-bold">{Math.round(progress)}%</span>}
                  </div>
                </div>
              </div>

              {raffle.status === 'drawn' && raffle.winner && (
                <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-300">
                  <div className="flex items-center gap-2 text-azul-royal font-bold mb-2">
                    <Trophy className="w-5 h-5" />
                    Vencedor
                  </div>
                  <div className="text-lg font-black text-emerald-900">{raffle.winner}</div>
                </div>
              )}
            </div>

            {isOpen && progress < 100 && (
              <>
                <div className="w-full mb-6">
                  <a href="/meus-bilhetes" className="block w-full bg-azul-royal hover:bg-branco hover:text-azul-royal border hover:border-azul-royal py-3 rounded-full font-bold text-center transition">
                    Meus Bilhetes
                  </a>
                </div>

                <LivroSelector
                  selectedQuantity={selectedQuantity}
                  onSelect={setSelectedQuantity}
                  availableLivros={availableLivros}
                />

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
                  <p className="text-xs text-gray-600 text-center mt-4">
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
              <div className="w-full bg-gray-200 text-cinza-escuro py-4 rounded-lg font-black text-center">
                Lote {raffle.status === 'drawn' ? 'Sorteado' : 'Fechado'}
              </div>
            )}

            {/* Ações de Admin */}
            <AdminLoteActions raffleId={id} raffleStatus={raffle.status} />
          </div>
        </div>

        {/* Top Compradores - mobile*/}
          <div className="lg:hidden block mt-8">
            <RaffleTopBuyers raffleId={id} />
          </div>
 
        {/* Disclaimer */}
        <div className="mt-12 bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
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
        <RaffleRegulation />
    </main>
  )
}
