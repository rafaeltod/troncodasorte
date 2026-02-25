'use client'

import { useState } from 'react'
import { LivroSelector } from './livro-selector'
import { CheckoutFlow } from './checkout-flow'
import { Drawer } from './drawer'

interface CupomData {
  id: string
  code: string
  discount: number
  tipoDesconto: string
  description: string | null
  loteId: string | null
  vendedor: { name: string }
}

interface RaffleDetailClientProps {
  raffleId: string
  livroPrice: number
  availableLivros: number
  isOpen: boolean
  cupom?: CupomData | null
}

export function RaffleDetailClient({
  raffleId,
  livroPrice,
  availableLivros,
  isOpen,
  cupom,
}: RaffleDetailClientProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const numericPrice = Number(livroPrice)
  const originalTotal = selectedQuantity * numericPrice

  // Calcular desconto
  let descontoTotal = 0
  if (cupom) {
    if (cupom.tipoDesconto === 'percentual') {
      descontoTotal = originalTotal * (cupom.discount / 100)
    } else {
      descontoTotal = Math.min(cupom.discount, originalTotal)
    }
  }
  const totalPrice = originalTotal - descontoTotal

  return (
    <>
      <LivroSelector
        selectedQuantity={selectedQuantity}
        onSelect={setSelectedQuantity}
        availableLivros={availableLivros}
      />
      
      <div className="mt-8 bg-linear-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-2 border-emerald-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Total a Pagar</p>
            {descontoTotal > 0 ? (
              <>
                <p className="text-lg text-gray-400 line-through">
                  R$ {originalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-3xl font-black text-emerald-700">
                  R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-blue-600 font-bold mt-1">
                  Desconto de R$ {descontoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com cupom {cupom?.code}
                </p>
              </>
            ) : (
              <p className="text-3xl font-black text-emerald-700">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        <button
onClick={() => setIsDrawerOpen(true)} disabled={!isOpen} className="w-full bg-emerald-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-black text-lg py-4 rounded-lg transition shadow-lg" > Comprar Agora </button> <p className="text-xs text-gray-600 text-center mt-4">
          Clique e preencha o formulário ao lado
        </p>
      </div>

      {/* Drawer de Checkout */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Finalizar Compra"
      >
        <CheckoutFlow
          raffleId={raffleId}
          livroPrice={livroPrice}
          availableLivros={availableLivros}
          isOpen={isOpen}
          selectedQuantity={selectedQuantity}
          cupom={cupom || undefined}
        />
      </Drawer>
    </>
  )
}
