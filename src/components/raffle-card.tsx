'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users, TrendingUp } from 'lucide-react'

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
  const percentageSold = (Number(soldQuotas) / Number(totalQuotas)) * 100
  const remainingQuotas = Number(totalQuotas) - Number(soldQuotas)

  return (
    <Link href={`/campanhas/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.png'
              }}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <div className="text-emerald-400 text-5xl">📦</div>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            R$ {Number(quotaPrice).toFixed(2)}
          </div>
          {percentageSold >= 80 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Quase Esgotado
            </div>
          )}
          {status === 'drawn' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-3xl">SORTEADA</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${percentageSold}%` }}
              />
            </div>
          </div>

          {/* Prize Info */}
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
            <div className="text-sm text-gray-600">Prêmio Principal</div>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {Number(prizeAmount).toFixed(2)}
            </div>
          </div>

          {/* Button */}
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors">
            Comprar Cotas
          </button>
        </div>
      </div>
    </Link>
  )
}
