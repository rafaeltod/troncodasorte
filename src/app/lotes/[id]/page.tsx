import Image from 'next/image'
import { getRaffleById } from '@/lib/queries'
import { ArrowLeft, Gift, Ticket, Users, Trophy, DollarSign, Package } from 'lucide-react'
import { formatDecimal } from '@/lib/formatters'
import { RaffleRegulation } from '@/components/lote-regulamentação'
import { CupomWrapper } from '@/components/cupom-wrapper'
import { RaffleImageGallery } from '@/components/lote-galeria-imagen'
import { AdminLoteActions } from '@/components/admin-lote-actions'
import { RaffleTopBuyers } from '@/components/lote-top-compradores'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function RaffleDetailPage({ params }: DetailProps) {
  const { id } = await params
  const raffle = await getRaffleById(id)

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Lote não encontrada</h1>
          <a href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            ← Voltar para lotes
          </a>
        </div>
      </div>
    )
  }

  const progress = (raffle.soldLivros / raffle.totalLivros) * 100
  const isOpen = raffle.status === 'open'
  
  // Garantir que images é sempre um array
  const images = Array.isArray(raffle.images) ? raffle.images : []
  const mainImage = typeof raffle.image === 'string' ? raffle.image : (images?.[0] || null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6 px-8">
          <a href="/" className=" items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold inline-flex transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-8">
          {/* Images */}
          <div className="w-full">
            {mainImage && (
              <RaffleImageGallery
                mainImage={mainImage}
                images={images}
                status={raffle.status}
              />
            )}
            
            {/* Top Compradores do Lote - Mobile/Tablet Below, PC on side */}
            <div className="md:block hidden">
              <RaffleTopBuyers raffleId={id} />
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              {raffle.status === 'drawn' && (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Trophy className="w-4 h-4" />
                  SORTEADO
                </span>
              )}
              {raffle.status === 'closed' && (
                <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <span>🔒</span>
                  FECHADO
                </span>
              )}
              {isOpen && (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Ticket className="w-4 h-4" />
                  ABERTO
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">{raffle.title}</h1>
            </div>

            {raffle.description && (
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">{raffle.description}</p>
            )}

            <div className="space-y-4 mb-8">
              {Number(raffle.prizeAmount) > 0 && (
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
                    <Gift className="w-4 h-4" />
                    Prêmio em Dinheiro
                  </div>
                  <div className="text-4xl font-black text-emerald-700">
                    R$ {formatDecimal(Number(raffle.prizeAmount))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-semibold mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Livro
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    R$ {formatDecimal(Number(raffle.livroPrice))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">Progresso de Vendas</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5 border border-gray-300 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-emerald-600 to-teal-600 h-5 rounded-full transition-all flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 10 && <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>}
                  </div>
                </div>
              </div>

              {raffle.status === 'drawn' && raffle.winner && (
                <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-300">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
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
                  <a href="/meus-bilhetes" className="block w-full bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-700 py-3 rounded-lg font-bold text-center transition">
                    📋 Meus Bilhetes
                  </a>
                </div>
                <CupomWrapper
                  raffleId={id}
                  livroPrice={Number(raffle.livroPrice)}
                  availableLivros={raffle.totalLivros - raffle.soldLivros}
                  isOpen={true}
                />
              </>
            )}

            {progress >= 100 && isOpen && (
              <div className="w-full bg-emerald-100 text-emerald-900 py-4 rounded-lg font-black text-center flex items-center justify-center gap-2">
                <span>✅</span>
                Todas as Livros Vendidas
              </div>
            )}

            {!isOpen && (
              <div className="w-full bg-gray-200 text-gray-900 py-4 rounded-lg font-black text-center">
                Lote {raffle.status === 'drawn' ? 'Sorteado' : 'Fechado'}
              </div>
            )}

            {/* Ações de Admin */}
            <AdminLoteActions raffleId={id} raffleStatus={raffle.status} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8 border border-gray-300">
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 ">Informações Importantes</p>
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
      </div>
    </div>
  )
}
