'use client'

import Image from 'next/image'
import Link from 'next/link'

interface RaffleCardProps {
  id: string
  title: string
  image?: string | null
  prizeAmount: number | string
  totalQuotas: number | string
  soldQuotas: number | string
  quotaPrice: number | string
  status: string
}

export function RaffleCard({
  id,
  title,
  image,
  prizeAmount,
  totalQuotas,
  soldQuotas,
  quotaPrice,
  status,
}: RaffleCardProps) {
  const progress = (Number(soldQuotas) / Number(totalQuotas)) * 100

  return (
    <Link href={`/rifas/${id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden cursor-pointer border border-slate-100">
        {image && (
          <div className="relative w-full h-48">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
            {status === 'drawn' && (
              <div className="absolute inset-0 bg-green-600 bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-black text-xl">✨ SORTEADA</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          <h3 className="font-black text-lg truncate text-slate-900 mb-3">{title}</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold text-sm">Prêmio:</span>
              <span className="font-black text-indigo-600 text-lg">R$ {Number(prizeAmount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold text-sm">Cota:</span>
              <span className="font-semibold text-slate-900">R$ {Number(quotaPrice).toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="text-xs font-semibold text-slate-600 text-center">
                {Number(soldQuotas)} / {Number(totalQuotas)} cotas
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-bold text-white bg-indigo-600 rounded-lg py-2 text-center">
                Ver Detalhes →
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
