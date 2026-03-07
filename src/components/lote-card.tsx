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
  cliente?: string
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
  cliente,
}: RaffleCardProps) {
  const percentageSold = (Number(soldLivros) / Number(totalLivros)) * 100
  const remainingQuotas = Number(totalLivros) - Number(soldLivros)

  return (
    <Link href={cliente ? `/${cliente}/lotes/${id}` : `/lotes/${id}`} className="block">
      <div className=" rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:bg-[#232F3E]">
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
            <div className="w-full h-full bg-azul-pastel  flex items-center justify-center">
              <div className="text-azul-claro text-5xl">📦</div>
            </div>
          )}
          <div className={`absolute top-3 right-3 ${status === 'closed' ? 'bg-gray-400' : 'bg-azul-royal'} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            R$ {formatDecimal(Number(livroPrice))}
          </div>
          {percentageSold >= 80 && status !== 'drawn' && (
            <div className="absolute top-3 left-3 bg-vermelho-claro text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Quase Esgotado
            </div>
          )}
          {status === 'drawn' && (
            <>
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute top-3 left-3 bg-verde-agua text-white px-4 py-2 rounded-full text-base font-bold shadow-lg z-10">
                Finalizado
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5" style={{ minHeight: '250px' }}>
          <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-1">
            {title}
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-azul-royal dark:bg-verde-menta h-3 rounded-full transition-all duration-300"
                style={{ width: `${percentageSold}%` }}
              />
            </div>
          </div>

          {/* Prize Info */}
          {Number(prizeAmount) > 0 ? (
            <div className="mb-4 p-3 bg-azul-pastel rounded-lg">
              <div className="text-sm text-gray-600">Prêmio em Dinheiro</div>
              <div className="text-2xl font-bold text-azul-royal">
                R$ {Number(prizeAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 h-[75.99px] line-clamp-2 py-3 px-4 rounded-lg bg-azul-pastel">
              <p className="text-gray-700 text-1x1 line-clamp-3">{description}</p>
            </div>
          )}

          {/* Button */}
          {status === 'closed' ? (
            <button
              disabled
              className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold "
            >
              Lote Fechado
            </button>
          ) : status === 'drawn' ? (
            <button
              disabled
              className="w-full bg-white text-azul-royal py-3 rounded-full font-semibold border-2 border-azul-royal"
            >
              Lote Sorteado
            </button>
          ) : (
            <button className="w-full bg-azul-royal dark:bg-azul-claro hover:bg-azul-claro dark:hover:bg-azul-claro/50 hover:cursor-pointer text-white py-3 rounded-full font-semibold transition-colors">
              Comprar Livros
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
