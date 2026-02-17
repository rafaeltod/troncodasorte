'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { formatDecimal } from '@/lib/formatters'

interface RaffleCardProps {
  id: string
  title: string
  description: string
  image?: string | null
  prizeAmount: number | string
  totalLivros: number | string
  soldLivros: number | string
  livroPrice: number | string
  status: string
}

export function RaffleCard({
  id,
  title,
  description,
  image,
  prizeAmount,
  totalLivros,
  soldLivros,
  livroPrice,
  status,
}: RaffleCardProps) {
  const percentageSold = (Number(soldLivros) / Number(totalLivros)) * 100
  const remainingQuotas = Number(totalLivros) - Number(soldLivros)

  return (
    <Link href={`/lotes/${id}`} className="block">
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
          <div className={`absolute top-3 right-3 ${status === 'closed' ? 'bg-gray-400' : 'bg-emerald-600'} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            R$ {formatDecimal(Number(livroPrice))}
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
        <div className="p-5" style={{ minHeight: '250px' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
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
          {Number(prizeAmount) > 0 ? (
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
              <div className="text-sm text-gray-600">Prêmio em Dinheiro</div>
              <div className="text-2xl font-bold text-emerald-600">
                R$ {formatDecimal(Number(prizeAmount))}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 h-[75.99px] line-clamp-2 py-3 px-4 rounded-lg">
              <p className="text-gray-700 text-1x1 line-clamp-3">{description}</p>
            </div>
          )}

          {/* Button */}
          {status === 'closed' ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold "
            >
              Lote Fechado
            </button>
          ) : status === 'drawn' ? (
            <button
              disabled
              className="w-full bg-emerald-400 text-white py-3 rounded-lg font-semibold "
            >
              Lote Sorteado
            </button>
          ) : (
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors">
              Comprar Livros
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
