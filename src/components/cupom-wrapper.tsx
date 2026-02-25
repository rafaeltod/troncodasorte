'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RaffleDetailClient } from './lote-detalhe-cliente'
import { Tag, X } from 'lucide-react'

interface CupomWrapperProps {
  raffleId: string
  livroPrice: number
  availableLivros: number
  isOpen: boolean
}

interface CupomData {
  id: string
  code: string
  discount: number
  tipoDesconto: string
  description: string | null
  loteId: string | null
  vendedor: { name: string }
}

export function CupomWrapper({ raffleId, livroPrice, availableLivros, isOpen }: CupomWrapperProps) {
  const searchParams = useSearchParams()
  const [cupom, setCupom] = useState<CupomData | null>(null)
  const [cupomError, setCupomError] = useState('')
  const [loadingCupom, setLoadingCupom] = useState(false)

  useEffect(() => {
    const cupomCode = searchParams.get('cupom')
    if (cupomCode) {
      validateCupom(cupomCode)
    }
  }, [searchParams])

  const validateCupom = async (code: string) => {
    setLoadingCupom(true)
    setCupomError('')
    try {
      const res = await fetch('/api/cupom/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, loteId: raffleId }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.valid) {
          setCupom(data.cupom)
        }
      } else {
        const data = await res.json()
        setCupomError(data.error || 'Cupom inválido')
      }
    } catch (error) {
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

  // Calcular desconto
  const calculateDiscount = (originalPrice: number): number => {
    if (!cupom) return 0
    if (cupom.tipoDesconto === 'percentual') {
      return originalPrice * (cupom.discount / 100)
    }
    return Math.min(cupom.discount, originalPrice)
  }

  return (
    <>
      {/* Cupom Banner */}
      {loadingCupom && (
        <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-700 font-bold">⏳ Validando cupom...</p>
        </div>
      )}

      {cupomError && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-bold text-sm">{cupomError}</p>
        </div>
      )}

      {cupom && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-black text-blue-800 text-sm">
                  Cupom aplicado: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{cupom.code}</span>
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {cupom.tipoDesconto === 'percentual'
                    ? `${cupom.discount}% de desconto`
                    : `R$ ${cupom.discount.toFixed(2)} de desconto`}
                  {cupom.vendedor && ` — via ${cupom.vendedor.name}`}
                </p>
              </div>
            </div>
            <button onClick={removeCupom} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <RaffleDetailClient
        raffleId={raffleId}
        livroPrice={livroPrice}
        availableLivros={availableLivros}
        isOpen={isOpen}
        cupom={cupom}
      />
    </>
  )
}
