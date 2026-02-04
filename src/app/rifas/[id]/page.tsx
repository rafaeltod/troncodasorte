import Image from 'next/image'
import { getRaffleById } from '@/lib/queries'

interface DetailProps {
  params: {
    id: string
  }
}

export default async function RaffleDetailPage({ params }: DetailProps) {
  const raffle = await getRaffleById(params.id)

  if (!raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Rifa não encontrada</h1>
          <a href="/rifas" className="text-blue-600 hover:underline">
            Voltar para rifas
          </a>
        </div>
      </div>
    )
  }

  const progress = (raffle.soldQuotas / raffle.totalQuotas) * 100
  const isOpen = raffle.status === 'open'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <a href="/rifas" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Voltar
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {raffle.image && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="relative w-full h-96">
                  <Image
                    src={raffle.image}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                  />
                  {raffle.status === 'drawn' && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">SORTEADA</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {raffle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {raffle.images.map((image: string, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative w-full h-20">
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
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              {raffle.status === 'drawn' && (
                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                  SORTEADA
                </span>
              )}
              {raffle.status === 'closed' && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                  FECHADA
                </span>
              )}
              {isOpen && (
                <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                  ABERTA
                </span>
              )}

              <h1 className="text-4xl font-bold mt-4">{raffle.title}</h1>
            </div>

            {raffle.description && (
              <p className="text-gray-600 mb-6">{raffle.description}</p>
            )}

            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Prêmio</div>
                <div className="text-3xl font-bold text-blue-600">
                  R$ {raffle.prizeAmount.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Cota</div>
                  <div className="text-2xl font-bold">
                    R$ {raffle.quotaPrice.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total de Cotas</div>
                  <div className="text-2xl font-bold">{raffle.totalQuotas}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-gray-600">
                    {raffle.soldQuotas} de {raffle.totalQuotas}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {raffle.status === 'drawn' && raffle.winner && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Vencedor</div>
                  <div className="text-lg font-bold text-green-700">{raffle.winner}</div>
                </div>
              )}
            </div>

            {isOpen && progress < 100 && (
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Comprar Cotas
              </button>
            )}

            {progress >= 100 && isOpen && (
              <div className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-center">
                Todas as Cotas Vendidas
              </div>
            )}

            {!isOpen && (
              <div className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-center">
                Rifa {raffle.status === 'drawn' ? 'Sorteada' : 'Fechada'}
              </div>
            )}
          </div>
        </div>

        {/* Purchases */}
        {raffle.purchases.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Últimas Compras</h2>
            <div className="space-y-3">
              {raffle.purchases.slice(0, 10).map((purchase: any) => (
                <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{purchase.user.name}</div>
                    <div className="text-sm text-gray-600">{purchase.quotas} cotas</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {purchase.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
