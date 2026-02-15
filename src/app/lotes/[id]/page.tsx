import Image from 'next/image'
import { getRaffleById } from '@/lib/queries'
import { ArrowLeft, Gift, Ticket, Users, Trophy } from 'lucide-react'
import { RaffleRegulation } from '@/components/raffle-regulation'
import { RaffleDetailClient } from '@/components/raffle-detail-client'
import { RaffleImageGallery } from '@/components/raffle-image-gallery'
import { AdminLoteActions } from '@/components/admin-lote-actions'

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
          <a href="/lotes" className="text-emerald-600 hover:text-emerald-700 font-semibold">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <a href="/lotes" className=" items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold inline-flex transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {mainImage && (
              <RaffleImageGallery
                mainImage={mainImage}
                images={images}
                status={raffle.status}
              />
            )}
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

              <h1 className="text-4xl font-black text-gray-900 mt-4">{raffle.title}</h1>
            </div>

            {raffle.description && (
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">{raffle.description}</p>
            )}

            <div className="space-y-4 mb-8">
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
                  <Gift className="w-4 h-4" />
                  Prêmio
                </div>
                <div className="text-4xl font-black text-emerald-700">
                  R$ {Number(raffle.prizeAmount).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-semibold mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Livro
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    R$ {Number(raffle.livroPrice).toFixed(2)}
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
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 h-5 rounded-full transition-all flex items-center justify-center"
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
                    Vencedor
                  </div>
                  <div className="text-lg font-black text-emerald-900">{raffle.winner}</div>
                </div>
              )}
            </div>

            {isOpen && progress < 100 && (
              <>
                <div className="w-full mb-6">
                  <a href="/meus-bilhetes" className="block w-full bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-700 py-3 rounded-lg font-bold text-center transition">
                    📋 Meus Bilhetes
                  </a>
                </div>
                <RaffleDetailClient
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
            <p className="font-bold text-gray-900">⚠️ Informações Importantes</p>
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
