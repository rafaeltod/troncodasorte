import Image from 'next/image'
import { getRaffleById } from '@/lib/queries'
import { QuotaPurchase } from '@/components/quota-purchase'
import { ArrowLeft, Gift, Ticket, Users, TrendingUp, Trophy, FileText } from 'lucide-react'

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
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Rifa não encontrada</h1>
          <a href="/rifas" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            ← Voltar para rifas
          </a>
        </div>
      </div>
    )
  }

  const progress = (raffle.soldQuotas / raffle.totalQuotas) * 100
  const isOpen = raffle.status === 'open'
  
  // Garantir que images é sempre um array
  const images = Array.isArray(raffle.images) ? raffle.images : []
  const mainImage = typeof raffle.image === 'string' ? raffle.image : (images?.[0] || null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <a href="/rifas" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-flex transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {mainImage && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 border border-gray-200">
                <div className="relative w-full h-[500px] bg-gray-100">
                  <Image
                    src={mainImage}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                  />
                  {raffle.status === 'drawn' && (
                    <div className="absolute inset-0 bg-emerald-500 bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <Trophy className="w-20 h-20 text-white mx-auto mb-2" />
                        <span className="text-white font-bold text-3xl">SORTEADA</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="relative w-full h-20 bg-gray-100">
                      <Image
                        src={image}
                        alt={`Imagem ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              {raffle.status === 'drawn' && (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Trophy className="w-4 h-4" />
                  SORTEADA
                </span>
              )}
              {raffle.status === 'closed' && (
                <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <span>🔒</span>
                  FECHADA
                </span>
              )}
              {isOpen && (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Ticket className="w-4 h-4" />
                  ABERTA
                </span>
              )}

              <h1 className="text-4xl font-black text-gray-900 mt-4">{raffle.title}</h1>
            </div>

            {raffle.description && (
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">{raffle.description}</p>
            )}

            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
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
                    Cota
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    R$ {Number(raffle.quotaPrice).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total
                  </div>
                  <div className="text-2xl font-black text-emerald-700">{raffle.totalQuotas}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">Progresso de Vendas</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {raffle.soldQuotas} de {raffle.totalQuotas}
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
              <QuotaPurchase 
                raffleId={id}
                quotaPrice={Number(raffle.quotaPrice)}
                availableQuotas={raffle.totalQuotas - raffle.soldQuotas}
                isOpen={true}
              />
            )}

            {progress >= 100 && isOpen && (
              <div className="w-full bg-emerald-100 text-emerald-900 py-4 rounded-lg font-black text-center flex items-center justify-center gap-2">
                <span>✅</span>
                Todas as Cotas Vendidas
              </div>
            )}

            {!isOpen && (
              <div className="w-full bg-gray-200 text-gray-900 py-4 rounded-lg font-black text-center">
                Rifa {raffle.status === 'drawn' ? 'Sorteada' : 'Fechada'}
              </div>
            )}
          </div>
        </div>

        {/* Purchases */}
        {raffle.purchases.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-8 h-8 text-emerald-600" />
              Últimas Compras
            </h2>
            <div className="space-y-3">
              {raffle.purchases.slice(0, 10).map((purchase: any) => (
                <div key={purchase.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition">
                  <div>
                    <div className="font-bold text-gray-900">{purchase.user.name}</div>
                    <div className="text-sm text-gray-600 font-semibold flex items-center gap-1 mt-1">
                      <Ticket className="w-4 h-4 text-emerald-600" />
                      {purchase.quotas} cotas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700 text-lg">R$ {Number(purchase.amount).toFixed(2)}</div>
                    <div className="text-xs text-gray-600 font-semibold">
                      {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regulamento Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-8 h-8 text-emerald-600" />
            Regulamento e Legislação
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Termos e Condições</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Esta rifa é organizada de acordo com os regulamentos da Lei nº 9.504/1997 e da Resolução do Tribunal Superior Eleitoral (TSE). 
                Todos os participantes devem aceitar os Termos e Condições da plataforma Tronco da Sorte.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">⚖️ Responsabilidade Legal</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                O organizador desta rifa é responsável por:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Manter registros completos de todas as transações</li>
                <li>Realizar o sorteio de forma justa e transparente</li>
                <li>Cumprir todas as obrigações legais e fiscais</li>
                <li>Proteger os dados pessoais dos participantes</li>
                <li>Entregar o prêmio ao vencedor conforme regulamentado</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">🔒 Transparência e Sorteio</h3>
              <p className="text-gray-700 leading-relaxed">
                O sorteio será realizado de forma pública e auditável. Todos os participantes serão notificados sobre:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Data e horário exato do sorteio</li>
                <li>Método de seleção do vencedor</li>
                <li>Resultado do sorteio em tempo real</li>
                <li>Dados do vencedor (apenas primeira letra do nome)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold">
                <strong>⚠️ Aviso Legal:</strong> A participação nesta rifa constitui aceitação automática de todos os termos, 
                condições e regulamentos estabelecidos. Para mais informações, consulte a <a href="/termos" className="text-emerald-600 hover:text-emerald-700 font-bold">Política de Termos</a> e 
                <a href="/privacidade" className="text-emerald-600 hover:text-emerald-700 font-bold"> Privacidade</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
