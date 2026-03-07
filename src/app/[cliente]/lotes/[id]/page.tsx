'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Gift, Ticket, Trophy, Settings, Loader2, CheckCircle2, FileText, Plus, Minus, DollarSign, Package, Tag, X, ShoppingCart, Info, Lock, Shield, CreditCard } from 'lucide-react'
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
  concursoCorrespondente?: string | null
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

// ---------- Sub-components ----------

function TopCompradores({ buyers, loading, error }: { buyers: TopBuyer[]; loading: boolean; error: string | null }) {
  if (loading) return (
    <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amarelo-gold" />
        <h2 className="text-2xl font-black text-cinza-escuro dark:text-amarelo-gold">Top Compradores</h2>
      </div>
      <div className="text-center text-cinza">Carregando...</div>
    </div>
  )
  if (error) return null
  if (buyers.length === 0) return (
    <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amarelo-gold" />
        <h2 className="text-2xl font-black text-cinza-escuro dark:text-amarelo-gold">Top Compradores</h2>
      </div>
      <div className="text-center text-cinza py-8">Nenhum comprador registrado ainda</div>
    </div>
  )
  return (
    <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amarelo-gold" />
        <h2 className="text-2xl font-black text-cinza-escuro dark:text-amarelo-gold">Top Compradores</h2>
      </div>
      <div className="space-y-3">
        {buyers.slice(0, 5).map((buyer, index) => (
          <div key={buyer.id} className="flex items-center justify-between p-1 bg-fundo-cinza rounded-lg hover:border-azul-royal transition">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-branco font-black text-lg">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && index + 1}
              </div>
              <div>
                <div className="font-black text-[19px] text-cinza-escuro">{censorName(buyer.name)}</div>
                <div className="text-cinza">{buyer.totalLivros.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {buyer.totalLivros === 1 ? 'livro' : 'livros'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-lg text-cinza-escuro">R$ {formatDecimal(buyer.totalSpent)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BilhetesPremiados({ raffle }: { raffle: RaffleDetail }) {
  const premios = raffle.status === 'drawn' && raffle.premiosAleatorios
    ? (typeof raffle.premiosAleatorios === 'string' ? JSON.parse(raffle.premiosAleatorios) : raffle.premiosAleatorios)
    : raffle.status !== 'drawn' && raffle.premiosConfig
    ? (typeof raffle.premiosConfig === 'string' ? JSON.parse(raffle.premiosConfig) : raffle.premiosConfig)
    : null

  if (!Array.isArray(premios) || premios.length === 0) return null

  const purchases = Array.isArray(raffle.purchases) ? raffle.purchases : []
  const findOwner = (num: string) => purchases.find(p => p.status === 'confirmed' && p.numbers?.split(',').map((n: string) => n.trim()).includes(num))?.user?.name
  const shortName = (name: string) => name.split(' ').slice(0, 2).join(' ')

  return (
    <section className="bg-branco dark:bg-cinza-cards rounded-lg p-2 md:p-4 mt-5">
      <div className="flex items-center gap-2 font-bold mb-1 ">
        <h1 className="text-azul-royal dark:text-amarelo-claro text-2xl">Bilhetes premiados</h1>
      </div>
      <p className="text-sm text-cinza dark:text-gray-400 mb-3">Esses prêmios serão sorteados após a porcentagem de vendas correspondente ser atingida</p>
      <div className="space-y-2">
        {premios.map((p: any, i: number) => {
          const owner = raffle.status !== 'drawn' && findOwner(p.number)
          return (
            <div key={i} className="bg-fundo-cinza dark:bg-amarelo-pastel border-cinza-claro dark:border-cinza-claro/50 hover:bg-cinza-claro dark:hover:bg-amarelo-claro rounded-lg px-3 py-4 flex flex-col flex-wrap max-w-screen gap-2">

              {(owner || p.winner?.name) ? (
                  <p className="text-[20px] font-semibold text-amarelo-gold mt-1">
                    🏆 {owner ? shortName(owner) : shortName(p.winner.name)}
                  </p>
                ) : (
                  <p className="text-[20px] font-semibold text-cinza">Disponivel</p>
                )}
            <div className='flex gap-2'>
              {raffle.status === 'drawn' && (
                <p className={`font-mono h-9 w-20 pt-1 flex items-center justify-center rounded-lg font-bold text-branco text-1xl whitespace-nowrap ${(owner || p.winner?.name) ? 'bg-amarelo-gold' : 'bg-azul-royal'}`}>
                  {p.number}
                </p>
              )}
              <div className="flex flex-wrap gap-2"> 
                {p.tipo === 'dinheiro' && p.valor && (
                  <span className={`inline-flex items-center gap-1 ${(owner || p.winner?.name) ? 'bg-amarelo-pastel text-amarelo-gold border-amarelo-gold' : 'bg-azul-pastel text-azul-royal'} text-1xl font-bold px-2 py-1 border rounded-lg w-fit`}>
                    R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {p.tipo === 'item' && p.descricao && (
                  <span className={`inline-flex items-center gap-1 ${(owner || p.winner?.name) ? 'bg-amarelo-pastel text-amarelo-gold border-amarelo-gold' : 'bg-azul-pastel text-azul-royal'} text-1xl font-bold border px-2 py-1 rounded-lg w-fit`}>
                    {p.descricao}
                  </span>
                )}
                {typeof p.porcentagemSorteio === 'number' && p.porcentagemSorteio > 0 && (
                  <span className={`inline-flex items-center gap-1 ${(owner || p.winner?.name) ? 'bg-amarelo-gold' : 'bg-azul-royal'} text-branco text-xs font-bold px-2 py-1 rounded-lg w-fit`}>
                    após {p.porcentagemSorteio}% vendidos
                  </span>
                )}
                {p.drawnNumber && (
                  <span className={`inline-flex items-center gap-1 ${(owner || p.winner?.name) ? 'bg-amarelo-gold' : 'bg-azul-royal'} text-branco text-xs font-bold px-2 py-1 rounded-lg w-fit`}>
                    Bilhete: {p.drawnNumber}
                  </span>
                )}
              </div> 
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------- Page ----------

export default function RaffleDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const cliente = typeof params?.cliente === 'string' ? params.cliente : ''
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
  const [resultadoShowForm, setResultadoShowForm] = useState(false)
  const [resultadoDrawnNumber, setResultadoDrawnNumber] = useState('')
  const [resultadoLoading, setResultadoLoading] = useState(false)
  const [resultadoError, setResultadoError] = useState<string | null>(null)
  const [resultadoData, setResultadoData] = useState<any>(null)
  const [resultadoConcurso, setResultadoConcurso] = useState<string>('')
  const [downloadingRelatorio, setDownloadingRelatorio] = useState(false)
  const [showDescontoInfo, setShowDescontoInfo] = useState(false)

  // Cupom states
  const [cupom, setCupom] = useState<{
    id: string
    code: string
    discount: number
    tipoDesconto: string
    description: string | null
    loteId: string | null
    vendedor: { name: string }
  } | null>(null)
  const [cupomError, setCupomError] = useState('')
  const [loadingCupom, setLoadingCupom] = useState(false)
  const [cupomInputCode, setCupomInputCode] = useState('')
  const [showCupomInput, setShowCupomInput] = useState(false)

  // Presets para seleção de quantidade
  const presetOptions = [10, 50, 100, 200]

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

  // Validar cupom
  const validateCupom = async (code: string) => {
    setLoadingCupom(true)
    setCupomError('')
    try {
      const res = await fetch('/api/cupom/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, loteId: id }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setCupom(data.cupom)
        setShowCupomInput(false)
        setCupomInputCode('')
      } else {
        setCupomError(data.error || 'Cupom inválido')
      }
    } catch {
      setCupomError('Erro ao validar cupom')
    } finally {
      setLoadingCupom(false)
    }
  }

  const removeCupom = () => {
    setCupom(null)
    setCupomError('')
    // Remover cupom da URL sem recarregar
    const url = new URL(window.location.href)
    url.searchParams.delete('cupom')
    window.history.replaceState({}, '', url.toString())
  }

  // Detectar cupom na URL (?cupom=CODIGO)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cupomCode = params.get('cupom')
    if (cupomCode) {
      validateCupom(cupomCode)
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
          <a href={`/${cliente}`} className="text-azul-claro hover:text-azul-royal font-semibold">
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
          <a href={`/${cliente}`} className="text-azul-claro hover:text-azul-royal font-semibold">
            ← Voltar para lotes
          </a>
        </div>
      </div>
    )
  }

  const progress = (raffle.soldLivros / raffle.totalLivros) * 100
  const isOpen = raffle.status === 'open'
  const availableLivros = raffle.totalLivros - raffle.soldLivros
  // Desconto progressivo
  const progressiveDiscountPct =
    selectedQuantity >= 200 ? 14 :
    selectedQuantity >= 150 ? 11 :
    selectedQuantity >= 100 ? 8 :
    selectedQuantity >= 50 ? 5 : 0
  // Calcular preço com descontos
  const originalTotal = Math.round(selectedQuantity * Number(raffle.livroPrice) * 100) / 100
  const progressiveDiscountAmount = Math.round(originalTotal * (progressiveDiscountPct / 100) * 100) / 100
  let descontoTotal = progressiveDiscountAmount
  if (cupom) {
    const baseAfterProgressive = originalTotal - progressiveDiscountAmount
    if (cupom.tipoDesconto === 'percentual') {
      descontoTotal += Math.round(baseAfterProgressive * (cupom.discount / 100) * 100) / 100
    } else {
      descontoTotal += Math.min(cupom.discount, baseAfterProgressive)
    }
    descontoTotal = Math.round(descontoTotal * 100) / 100
  }
  const totalPrice = Math.round((originalTotal - descontoTotal) * 100) / 100
  const images = Array.isArray(raffle.images) ? raffle.images : []
  const mainImage = typeof raffle.image === 'string' ? raffle.image : (images?.[0] || null)

  return (
    <div className="min-h-screen bg-{background}">
      <main className={`${mainConfig} min-h-screen`}>
        <div className="flex items-center justify-between my-5 px-2 md:px-4">
          <a href={`/${cliente}`} className=" items-center gap-2 text-azul-royal dark:text-amarelo-claro font-semibold inline-flex transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5 ">
          {/* Images */}
          <div className="w-full">
            <div className="relative">
              {mainImage && (
                <RaffleImageGallery
                  mainImage={mainImage}
                  images={images}
                  status={raffle.status}
                />
              )}
              <div className="absolute top-3 right-3 z-10">
                {raffle.status === 'drawn' && (
                  <span className="inline-flex items-center gap-2 bg-amarelo-pastel text-amarelo-gold px-4 py-2 rounded-full text-sm font-bold shadow">
                    <Trophy className="w-4 h-4" />
                    SORTEADO
                  </span>
                )}
                {raffle.status === 'closed' && (
                  <span className="inline-flex items-center gap-2 bg-vermelho-pastel text-vermelho-vivo px-4 py-2 rounded-full text-sm font-bold shadow">
                    <span>🔒</span>
                    FECHADO
                  </span>
                )}
                {isOpen && (
                  <span className="inline-flex items-center gap-2 bg-verde-pastel text-verde-agua px-4 py-2 rounded-full text-sm font-bold shadow">
                    <Ticket className="w-4 h-4" />
                    ABERTO
                  </span>
                )}
              </div>
            </div>
            {/* Bilhetes premiados */}
            <div className="hidden lg:block">
              <BilhetesPremiados  raffle={raffle} />
            </div>
            
            
          </div>

          {/* Info */}
          <div className="bg-branco dark:bg-[#232F3E] rounded-2xl shadow-lg p-2 md:p-8 border border-cinza-claro dark:border-[#232F3E]">

            <h1 className="text-2xl md:text-2xl font-black text-cinza-escuro dark:text-amarelo-gold">{raffle.title}</h1>

            {raffle.description && (
              <p className="text-cinza-escuro dark:text-amarelo-claro mb-6 text-lg leading-relaxed">{raffle.description}</p>
            )}

            <div className="mb-4">
              <div className='flex mb-8 gap-5 flex-wrap'>
                <div className="bg-cinza-claro px-3 py-2 rounded-lg">
                  <div className="text-sm text-cinza font-semibold flex items-center gap-1">
                    <Ticket className="w-4 h-4" />
                    Livro
                  </div>
                  <div className="text-2xl font-black text-cinza">
                    R$ {formatDecimal(Number(raffle.livroPrice))}
                  </div>
                </div>

              {Number(raffle.prizeAmount) > 0 && (
                <div className="bg-amarelo-pastel px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-1 text-sm text-amarelo-gold font-semibold">
                    <Gift className="w-4 h-4" />
                    Prêmio em Dinheiro
                  </div>
                  <div className="text-2xl font-black text-amarelo-gold">
                    R$ {Number(raffle.prizeAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-cinza-escuro dark:text-amarelo-claro">Progresso de Vendas</span>
                  <span className="text-sm font-bold text-azul-royal">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-cinza-claro rounded-full h-5 border border-cinza overflow-hidden">
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
                <div className="bg-amarelo-pastel p-4 rounded-lg mt-6">
                  <div className="flex items-center gap-3 text-amarelo-gold text-3xl font-bold mb-3">
                    <Trophy className="w-10 h-10" />
                    Resultado do Sorteio
                  </div>
                  {raffle.winnerNumber && (
                    <div className="mb-3">
                      <p className="text-[20px] text-cinza">Número vencedor</p>
                      <p className="text-[35px] font-mono font-black text-amarelo-gold">{raffle.winnerNumber}</p>
                      {raffle.drawnNumber && raffle.drawnNumber !== raffle.winnerNumber && (
                        <p className="text-2xl text-cinza mt-1">Número sorteado: {raffle.drawnNumber}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-[20px] text-cinza-escuro">Ganhador Principal</p>
                    <p className="text-[20px] font-black text-amarelo-gold">
                      {raffle.winnerUser?.name ? raffle.winnerUser.name.split(' ').slice(0, 2).join(' ') : 'Participante'}
                    </p>
                  </div>
                  {user?.isAdmin && (
                    <div className="mt-3 pt-3 border-t border-amarelo-gold/30">
                      <p className="text-xs text-cinza-escuro/70 mb-0.5">Sorteio Correspondente</p>
                      <p className="text-sm font-semibold text-cinza-escuro">
                        {raffle.concursoCorrespondente || 'Concurso não indicado'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-1xl font-bold text-cinza dark:text-branco">Desconto Progressivo</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowDescontoInfo(v => !v)}
                    className="text-cinza hover:text-azul-royal dark:text-cinza-claro transition cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showDescontoInfo && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDescontoInfo(false)} />
                      <div className="absolute right-0 top-6 z-20 w-69 bg-cinza-escuro dark:bg-cinza-cards text-branco text-sm rounded-xl shadow-xl px-4 py-3">
                        Quanto mais livros forem comprados, maior será o desconto.
                      </div>
                    </>
                  )}
                </div>
              </div>
              <ol className="grid grid-cols-2 w-full gap-2 mt-3">
                {[
                  { min: 50,  pct: 5  },
                  { min: 100, pct: 8  },
                  { min: 150, pct: 11 },
                  { min: 200, pct: 14 },
                ].map(({ min, pct }) => {
                  const active = progressiveDiscountPct === pct
                  return (
                    <li
                      key={min}
                      className={`w-full flex items-center justify-between rounded-lg py-1 px-4 transition ${
                        active
                          ? 'bg-azul-royal text-branco font-bold ring-2 ring-azul-royal'
                          : 'bg-azul-pastel text-azul-royal'
                      }`}
                    >
                      <span className="flex flex-col md:flex-row md:items-center md:gap-1 leading-tight">
                        <span>+{min}</span>
                        <span>Livros</span>
                      </span>
                      <span className={`py-1 px-2 rounded-lg text-1xl ${
                        active ? 'bg-branco text-azul-royal font-bold' : 'bg-azul-royal text-branco'
                      }`}>
                        -{pct}%
                      </span>
                    </li>
                  )
                })}
              </ol>
                
            </div>

            {isOpen && progress < 100 && (
              <>
                {/* Valores Fixos */}
                <div className="bg-branco dark:bg-cinza-cards rounded-2xl">
                  <h3 className="text-1xl md:text-1xl font-black text-cinza dark:text-amarelo-claro mb-2">Compra rápida: Ebook + Titulos</h3>
                  <p className='text-cinza dark:text-branco text-sm mb-3'>Ao escolher um dos pacotes abaixo, você receberá o e-Book digital desta ação no email cadastrado, junto com os seus titulos</p>

                  <div className="grid grid-cols-1 md:grid-cols-2  gap-3 mb-4">
                    {presetOptions.map((quantity) => {
                      const isDisabled = quantity > availableLivros
                      return (
                        <button
                          key={quantity}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedQuantity(quantity)
                              setIsDrawerOpen(true)
                            }
                          }}
                          disabled={isDisabled}
                          className={`py-1 px-3 rounded-xl flex h-15 justify-between font-bold text-lg transition transform ${
                            isDisabled
                              ? 'bg-cinza-claro text-cinza cursor-not-allowed'
                              : 'bg-azul-claro text-branco border-2 border-azul-claro hover:bg-branco hover:text-azul-royal cursor-pointer hover:scale-105'
                          }`}
                        >
                          <div>
                            {quantity} {quantity === 1 ? 'livro' : 'livros'}
                            <p className="text-xs ">Títulos + Ebook</p>
                          </div>
                          <span className='bg-azul-pastel font-[15px] w-25 text-azul-royal px-2 py-1 rounded-lg flex items-center justify-center'>
                            R$ {(quantity * Number(raffle.livroPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </button>
                      )
                    })}

                    
                  </div>
                  {/* Digitar quantidade */}

                    <div className="space-y-3 w">
                    <p className="text-1xl md:text-1xl font-black text-cinza dark:text-amarelo-claro">Digite a quantidade:</p>
                    {availableLivros <= selectedQuantity && (
                      <p className="text-vermelho-vivo text-sm">Limite atingido</p>
                    )}
                    <div className="flex items-center bg-cinza-claro rounded-full box-border mb-4 h-10">
                      <button
                        onClick={() => {
                          const newValue = Math.max(1, selectedQuantity - 1)
                          setSelectedQuantity(newValue)
                        }}
                        className="flex items-center justify-center w-10 h-10 hover:bg-cinza hover:text-branco text-cinza rounded-lg font-black text-xl transition cursor-pointer rounded-tl-full rounded-bl-full"
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
                        className="flex-1 text-center text-1xl font-black text-cinza bg-transparent border-0 focus:outline-none"
                      />

                      <button
                        onClick={() => {
                          const newValue = Math.min(availableLivros, selectedQuantity + 1)
                          setSelectedQuantity(newValue)
                        }}
                        disabled={selectedQuantity >= availableLivros}
                        className="flex  items-center justify-center w-10 h-10 hover:bg-cinza hover:text-branco text-cinza font-black text-xl transition cursor-pointer disabled:bg-cinza-claro disabled:cursor-not-allowed"
                        title="Aumentar quantidade"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        disabled={!isOpen}
                        className="flex h-10 w-20 md:w-50 items-center justify-center gap-2 bg-azul-royal hover:bg-branco hover:text-azul-royal cursor-pointer disabled:bg-cinza rounded-br-full rounded-tr-full disabled:border-cinza text-branco font-black text-[15px] md:text-lg py-3 rounded-xl transition shadow-lg"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cupom Banner */}
                {loadingCupom && (
                  <div className="mb-4 bg-azul-pastel rounded-xl p-4 text-center">
                    <p className="text-azul-royal font-bold">Validando cupom...</p>
                  </div>
                )}

                {cupomError && (
                  <div className="mb-4 bg-vermelho-pastel rounded-xl p-4">
                    <p className="text-vermelho-vivo font-bold text-sm">{cupomError}</p>
                  </div>
                )}

                {cupom && (
                  <div className="mb-4 bg-azul-pastel rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-azul-claro" />
                        <div>
                          <p className="font-black text-azul-claro text-sm">
                            Cupom aplicado: <span className="font-mono bg-azul-claro px-2 py-0.5 rounded">{cupom.code}</span>
                          </p>
                          <p className="text-xs text-azul-claro mt-0.5">
                            {cupom.tipoDesconto === 'percentual'
                              ? `${cupom.discount}% de desconto`
                              : `R$ ${cupom.discount.toFixed(2)} de desconto`}
                            {cupom.vendedor && ` — via ${cupom.vendedor.name}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={removeCupom} className="text-cinza hover:text-cinza p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Inserir cupom manualmente */}
                {!cupom && (
                  <div className="mb-4">
                    {!showCupomInput ? (
                      <button
                        onClick={() => setShowCupomInput(true)}
                        className="text-lx text-azul-royal dark:text-amarelo-gold font-semibold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Tag className="w-4 h-4" />
                        Tem um cupom de desconto?
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cupomInputCode}
                          onChange={(e) => setCupomInputCode(e.target.value.toUpperCase())}
                          placeholder="Digite o código"
                          className="flex-1 border text-cinza border-azul-royal dark:border-amarelo-gold dark:text-amarelo-claro rounded-lg px-3 py-2 text-lx font-mono uppercase focus:outline-none focus:ring-2 focus:ring-azul-royal"
                        />
                        <button
                          onClick={() => {
                            if (cupomInputCode.trim()) validateCupom(cupomInputCode.trim())
                          }}
                          disabled={loadingCupom || !cupomInputCode.trim()}
                          className="bg-azul-royal text-branco px-4 py-2 rounded-lg text-sm font-bold hover:bg-azul-claro disabled:bg-cinza transition"
                        >
                          {loadingCupom ? 'Validando...' : 'Aplicar'}
                        </button>
                        <button
                          onClick={() => { setShowCupomInput(false); setCupomInputCode(''); setCupomError('') }}
                          className="text-cinza hover:text-cinza-escuro p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                    <div>
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
                    cupom={cupom || undefined}
                    progressiveDiscountPct={progressiveDiscountPct}
                    cliente={cliente}
                  />
                </Drawer>
              </>
            )}

            {progress >= 100 && isOpen && (
              <div className="w-full bg-cinza text-branco py-4 rounded-full font-black text-center flex items-center justify-center gap-2">
                Todos os Livros Vendidos
              </div>
            )}

            {!isOpen && (
              <div className="w-full bg-cinza-claro text-cinza-escuro py-4 rounded-full font-black text-center">
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
                  <button
                    onClick={async () => {
                      setDownloadingRelatorio(true)
                      try {
                        const res = await fetch(`/api/admin/lotes/${id}/relatorio`, { credentials: 'include' })
                        if (!res.ok) throw new Error('Erro ao gerar relatório')
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        const disposition = res.headers.get('Content-Disposition')
                        const filenameMatch = disposition?.match(/filename="(.+)"/)
                        a.download = filenameMatch?.[1] || `relatorio-lote-${id}.xlsx`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      } catch (err) {
                        console.error('Erro ao baixar relatório:', err)
                        alert('Erro ao gerar relatório. Tente novamente.')
                      } finally {
                        setDownloadingRelatorio(false)
                      }
                    }}
                    disabled={downloadingRelatorio}
                    className="flex-1 min-w-35 bg-branco border border-azul-royal hover:bg-azul-royal hover:text-branco text-azul-royal font-semibold py-2 px-4 rounded-full transition text-center flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {downloadingRelatorio ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Relatório Excel
                      </>
                    )}
                  </button>
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
                      <div className="bg-azul-pastel border-2 border-azul-royal text-azul-royal px-6 py-4 rounded-xl flex items-center gap-3 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        Campanha finalizada com sucesso!
                      </div>
                    )}
                  </div>
                )}

                {/* Cadastrar Resultado Section */}
                {raffle.status === 'closed' && (
                  <div className="mt-6">
                    {resultadoData ? (
                      <div className="bg-azul-pastel border-2 border-azul-royal rounded-xl p-6">
                        <div className="flex items-center gap-2 text-azul-royal font-bold mb-4">
                          <Trophy className="w-5 h-5" />
                          Resultado Cadastrado!
                        </div>
                        <div className="space-y-3">
                          <div className="bg-branco rounded-lg p-4 border border-azul-claro">
                            <p className="text-sm text-cinza mb-1">Número sorteado (digitado)</p>
                            <p className="text-2xl font-mono font-bold text-cinza-escuro">{resultadoData.drawnNumber}</p>
                          </div>
                          <div className="bg-branco rounded-lg p-4 border border-azul-claro">
                            <p className="text-sm text-cinza mb-1">Número vencedor (correspondente)</p>
                            <p className="text-2xl font-mono font-bold text-azul-royal">{resultadoData.winnerNumber}</p>
                            {resultadoData.incrementos > 0 && (
                              <p className="text-xs text-cinza mt-1">
                                +{resultadoData.incrementos} incremento{resultadoData.incrementos > 1 ? 's' : ''} a partir do número sorteado
                              </p>
                            )}
                          </div>
                          {resultadoData.winner && (
                            <div className="bg-branco rounded-lg p-4 border border-azul-claro">
                              <p className="text-sm text-cinza mb-1">Ganhador Principal</p>
                              <p className="text-lg font-bold text-cinza-escuro">{resultadoData.winner.name.split(' ').slice(0, 2).join(' ')}</p>
                            </div>
                          )}
                          {resultadoData.concursoCorrespondente && (
                            <div className="bg-branco rounded-lg p-4 border border-azul-claro">
                              <p className="text-sm text-cinza mb-1">Sorteio Correspondente</p>
                              <p className="text-lg font-bold text-azul-royal">{resultadoData.concursoCorrespondente}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-4 w-full bg-azul-royal hover:bg-azul-royal text-branco font-bold py-3 px-6 rounded-xl transition"
                        >
                          Recarregar Página
                        </button>
                      </div>
                    ) : !resultadoShowForm ? (
                      <button
                        onClick={() => setResultadoShowForm(true)}
                        className="w-full bg-azul-royal hover:bg-azul-royal rounded-full cursor-pointer text-branco font-bold py-3 px-6 transition flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-5 h-5" />
                        Cadastrar Resultado
                      </button>
                    ) : (
                      <div className="bg-azul-pastel border-2 border-azul-claro rounded-xl p-6">
                        <p className="text-azul-royal font-semibold mb-4 flex items-center gap-2">
                          Informe o número
                        </p>
                        <p className="text-azul-royal text-sm mb-4">
                          Digite o número entre 000000 e 999999. O sistema irá verificar se existe um bilhete correspondente.
                          Caso não exista, será feito o incremento automático até encontrar um bilhete válido.
                        </p>

                        <div className="mb-4">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={resultadoDrawnNumber}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6)
                              setResultadoDrawnNumber(cleaned)
                            }}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] bg-branco border-2 border-azul-royal rounded-lg py-3 px-4 focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro text-cinza-escuro placeholder-cinza"
                          />
                          <p className="text-xs text-cinza mt-1 text-center">
                            {resultadoDrawnNumber.length}/6 dígitos — será completado com zeros à esquerda
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm text-azul-royal font-semibold mb-2">Sorteio Correspondente</label>
                          <input
                            type="text"
                            value={resultadoConcurso}
                            onChange={(e) => setResultadoConcurso(e.target.value.toUpperCase())}
                            placeholder="Ex.: Concurso 3625 (02/03/2026)"
                            className="w-full text-lg font-semibold bg-branco border-2 border-azul-claro rounded-lg py-3 px-4 focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro text-cinza-escuro placeholder-gray-300"
                          />
                        </div>

                        {resultadoError && (
                          <p className="text-vermelho-vivo bg-vermelho-pastel px-4 py-2 rounded mb-4 text-sm">
                            {resultadoError}
                          </p>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={async () => {
                              if (resultadoDrawnNumber.length === 0) {
                                setResultadoError('Informe o número do sorteio')
                                return
                              }

                              if (resultadoConcurso.trim().length === 0) {
                                setResultadoError('Informe o sorteio correspondente')
                                return
                              }

                              if (!resultadoConcurso.trim().toUpperCase().startsWith('CONCURSO')) {
                                setResultadoError('O sorteio deve começar com "Concurso"')
                                return
                              }

                              const numberPadded = resultadoDrawnNumber.padStart(6, '0')
                              setResultadoLoading(true)
                              setResultadoError(null)

                              try {
                                const response = await fetch(`/api/admin/lotes/${id}/resultado`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    drawnNumber: numberPadded,
                                    concursoCorrespondente: resultadoConcurso.trim()
                                  }),
                                })

                                const data = await response.json()

                                if (!response.ok) {
                                  throw new Error(data.error || 'Erro ao cadastrar resultado')
                                }

                                setResultadoData(data.resultado)
                                setResultadoShowForm(false)
                              } catch (err: any) {
                                setResultadoError(err.message)
                              } finally {
                                setResultadoLoading(false)
                              }
                            }}
                            disabled={resultadoLoading}
                            className="flex-1 bg-azul-royal hover:bg-azul-royal disabled:bg-azul-royal text-branco font-bold py-3 px-4 rounded-full transition flex items-center justify-center gap-2"
                          >
                            {resultadoLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Buscando bilhete...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Cadastrar Resultado
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setResultadoShowForm(false)
                              setResultadoError(null)
                              setResultadoDrawnNumber('')
                              setResultadoConcurso('')
                            }}
                            disabled={resultadoLoading}
                            className="flex-1 bg-cinza-claro hover:bg-cinza-escuro hover:text-branco cursor-pointer text-cinza font-bold py-3 px-4 rounded-full transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* caixinhas dos "termos"?? */}
            <ol className='w-full flex flex-wrap gap-2 mt-5 align-top'>
              <li className="rounded-full py-1 px-3 text-branco bg-cinza dark:bg-cinza-claro dark:text-azul-royal flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <p>Conexão segura (HTTPS)</p>
              </li>
              
              <li className="rounded-full py-1 px-3 text-branco bg-cinza dark:bg-cinza-claro flex items-center gap-1 dark:text-azul-royal">
                <Shield className="w-3 h-3" />
                <p>Proteção LGPD</p>
              </li>

              <li className="rounded-full py-1 px-3 text-branco bg-cinza dark:bg-cinza-claro flex items-center gap-1 dark:text-azul-royal">
                <CreditCard className="w-3 h-3" />
                <p>Pagamento confiavel</p>
              </li>
                
            </ol>
          </div>
          
        </div>

        
        {/* Bilhetes premiados */}
            <div className="block lg:hidden">
              <BilhetesPremiados  raffle={raffle} />
            </div>
        {/* Top Compradores - mobile */}
        <div className="lg:hidden block mt-8">
          <TopCompradores buyers={buyers} loading={buyersLoading} error={buyersError} />
        </div>

        {/* Top Compradores - mobile */}
        <div className="hidden md:block mt-8">
          <TopCompradores buyers={buyers} loading={buyersLoading} error={buyersError} />
        </div>

        
 
        {/* Disclaimer */}
        <div className="mt-12 bg-fundo-cinza rounded-2xl shadow-lg p-8 border border-cinza-claro">
          <div className="space-y-4 text-1xl text-cinza leading-relaxed">
            <p className="font-bold text-cinza-escuro ">Informações Importantes</p>
            <p>
              Este bilhete de loteria está autorizado com base no termo de autorização descrito no regulamento da promoção. Antes de contratar, consulte o Regulamento do produto. É proibida a venda para menores de 18 anos.
            </p>
            <p>
              Os sorteios e entrega dos prêmios serão realizados de acordo com os critérios estabelecidos neste site, nos termos seguintes: O adquirente concorrerá em todos os sorteios previstos no bilhete digital emitido, mesmo do contemplado em alguns deles.
            </p>
            <p>
              Ao contribuir, o titular do BILHETE Digital concorda desde já e sem ônus a utilização de seu nome, sua voz e imagem para a divulgação desta lote social.
            </p>
          </div>
        </div>

        {/* Regulamento */}
        <div className="mt-16 bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
          <h2 className="text-2xl font-black text-cinza mb-6 flex items-center gap-2">
            Regulamento da Campanha
          </h2>

          <div className="space-y-4">
            <AccordionItem title="Organização e Autorização">
              <div className="text-cinza leading-relaxed space-y-3">
                <p>
                  <span className="font-semibold">Organizador:</span> FM Agenciamento Publicitário &amp; Intermediação de Negócios LTDA, inscrita no CNPJ nº 30.999.856/0001-83, possui o TERMO DE AUTORIZAÇÃO LTP-PRC-2025/02507 da LOTERIA DO ESTADO DA PARAÍBA (LOTEP) para a exploração da atividade lotérica, baseada na Lei Estadual nº 12.703/2023.
                </p>
                <p>
                  Este regulamento estabelece os critérios para a distribuição de prêmios no âmbito do sorteio. Cada participante terá a oportunidade de ganhar conforme os prêmios divulgados no site. Os números premiados serão anunciados previamente e estarão disponíveis para consulta dos participantes.
                </p>
                <p>
                  É imprescindível que o participante guarde seu bilhete após a compra, pois será necessário apresentá-lo para reivindicar o prêmio em caso de vitória.
                </p>
              </div>
            </AccordionItem>

            <AccordionItem title="Elegibilidade e Participação">
              <div className="text-cinza leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>A participação está aberta exclusivamente a pessoas físicas maiores de 18 anos.</li>
                  <li>Funcionários da empresa organizadora, familiares diretos e indivíduos envolvidos na administração do sorteio são inelegíveis.</li>
                  <li>É necessário registro na plataforma e aquisição de bilhetes para entrar no sorteio.</li>
                </ul>
              </div>
            </AccordionItem>

            <AccordionItem title="Processo de Resgate de Prêmios">
              <div className="text-cinza leading-relaxed space-y-3">
                <p>
                  Para reivindicar um dos prêmios disponíveis, os ganhadores deverão submeter a documentação necessária, incluindo identidade (RG) e Cadastro de Pessoas Físicas (CPF), além do recibo do bilhete lotérico vencedor. A apresentação e validação desses documentos são passos cruciais para efetivar o resgate do prêmio. Importante salientar que os ganhadores possuem um prazo de <span className="font-semibold">90 dias</span>, a contar da data de anúncio do resultado, para completar esse processo.
                </p>
                <p className="font-semibold">Prazos de Entrega:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Prêmios em espécie serão depositados nas contas dos vencedores dentro de um prazo máximo de <span className="font-semibold">5 dias úteis</span> após a validação da documentação.</li>
                  <li>Para os prêmios físicos, a entrega será realizada em até <span className="font-semibold">10 dias úteis</span>, facilitando o processo para que o ganhador receba o prêmio sem complicações.</li>
                </ul>
              </div>
            </AccordionItem>

            <AccordionItem title="Despesas e Impostos">
              <div className="text-cinza leading-relaxed space-y-3">
                <p>
                  A FM Agenciamento Publicitário &amp; Intermediação de Negócios LTDA organizará todas as despesas necessárias para a entrega dos prêmios, assegurando aos ganhadores o recebimento do prêmio líquido, já deduzidos todos os impostos aplicáveis.
                </p>
                <p>
                  Todos os prêmios descritos neste regulamento serão entregues líquidos de imposto de renda.
                </p>
              </div>
            </AccordionItem>

            <AccordionItem title="Procedimento de Sorteio">
              <div className="text-cinza leading-relaxed space-y-3">
                <p>
                  Os sorteios serão realizados com base na extração da Loteria Federal do dia descrito nesta campanha, na hora e local divulgados pela Caixa Econômica Federal. Este processo será executado seguindo um protocolo estrito para assegurar transparência, integridade e imparcialidade.
                </p>
                <p>
                  O evento ocorrerá no dia anunciado no site, permitindo aos participantes e interessados acompanharem a extração dos números de maneira virtual.
                </p>
                <p>
                  <span className="font-semibold">Transmissão Ao Vivo:</span> Para garantir a máxima transparência e permitir a participação ampla do público, o sorteio será transmitido ao vivo através dos canais oficiais Caixa. Isso possibilita que todos os interessados, independentemente de sua localização, possam acompanhar cada etapa do sorteio em tempo real.
                </p>
              </div>
            </AccordionItem>

            <AccordionItem title="Forma de Apuração do Sorteio">
              <div className="text-cinza leading-relaxed space-y-3">
                <p className="font-semibold">LOTERIA FEDERAL</p>
                <p>
                  Para identificar o bilhete sorteado, ao menos um Número da Sorte impresso no título deverá coincidir com o número formado pela combinação dos três últimos algarismos do primeiro e do segundo prêmio da extração da Loteria Federal, conforme exemplo apresentado abaixo:
                </p>
                <div className="bg-fundo-cinza rounded-lg p-3 font-mono text-sm space-y-1">
                  <p className="font-semibold text-cinza-escuro">Exemplo:</p>
                  <p>1º Prêmio: 12345 → <span className="font-bold text-azul-royal">345</span></p>
                  <p>2º Prêmio: 98746 → <span className="font-bold text-azul-royal">746</span></p>
                  <p className="mt-2 font-bold text-cinza-escuro">Bilhete ganhador: 345.746</p>
                </div>
                <p className="font-semibold">Regra de Aproximação:</p>
                <p>
                  Caso a combinação contemplada, apurada pela forma descrita, não tenha sido distribuída a um participante, será aplicada a seguinte regra de aproximação: será contemplado o participante que possuir o próximo Número da Sorte imediatamente superior ao efetivamente apurado, na forma acima, até que seja identificado um participante contemplado em cada uma das premiações desta modalidade.
                </p>
                <p>
                  Para garantir total transparência e facilidade de compreensão, a apuração do ganhador seguirá o seguinte procedimento:
                </p>
                <p className="font-semibold">Procedimento passo a passo:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Primeiro, é verificado o Número Ganhador divulgado pela loteria base (ou método oficial adotado). Esse é o número que inicia a busca pelo vencedor.</li>
                  <li>Se alguém tiver exatamente esse número, pronto: essa pessoa é a ganhadora.</li>
                  <li>Se ninguém tiver esse número, começamos uma busca para cima, sempre procurando o próximo número imediatamente superior.</li>
                  <li>Caso a busca chegue ao último número da lista, o 999.999, e ainda não exista ganhador, o sistema não para. Ele simplesmente dá uma volta e retorna para o número 000.000, continuando a verificação para cima até encontrar alguém que tenha adquirido aquele número.</li>
                  <li>Assim que um número válido e vendido for encontrado, seu titular será declarado o vencedor.</li>
                </ol>
                <div className="bg-fundo-cinza rounded-lg p-3 font-mono text-sm space-y-1">
                  <p className="font-semibold text-cinza-escuro">Exemplo de aproximação:</p>
                  <p>Número sorteado: <span className="font-bold text-azul-royal">345.746</span></p>
                  <p>Se ninguém tiver esse número, verificamos o <span className="font-bold">345.747</span>.</p>
                  <p>Se ainda não houver comprador, verificamos o <span className="font-bold">345.748</span>, e assim por diante.</p>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem title="Prêmios">
              <div className="text-cinza leading-relaxed space-y-3">
                <p className="font-semibold">Prêmio Principal (Loteria Federal):</p>
                <div className="bg-amarelo-pastel rounded-lg p-3">
                  <p className="text-amarelo-gold font-black text-lg">1x PORSCHE MACAN 0KM</p>
                </div>
                <p className="font-semibold mt-2">Bilhetes Premiados (Instantânea):</p>
                <p>Não há bilhetes premiados.</p>
              </div>
            </AccordionItem>

            <div className="bg-azul-pastel rounded-lg p-4 mt-4">
              <p className="text-sm text-azul-royal font-semibold">
                <strong>Aviso Legal:</strong> A participação nesta campanha constitui aceitação automática de todos os termos,
                condições e regulamentos estabelecidos. Para mais informações, consulte a{' '}
                <a href={`/${cliente}/termos`} className="text-azul-claro hover:text-azul-royal font-bold">
                  Política de Termos
                </a>{' '}
                e{' '}
                <a href={`/${cliente}/privacidade`} className="text-azul-claro hover:text-azul-royal font-bold">
                  Privacidade
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

