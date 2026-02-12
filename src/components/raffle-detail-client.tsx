'use client'

import { useState } from 'react'
import { QuotaSelector } from './quota-selector'
import { CheckoutFlow } from './checkout-flow'
import { Drawer } from './drawer'

interface RaffleDetailClientProps {
  raffleId: string
  quotaPrice: number
  availableQuotas: number
  isOpen: boolean
}

export function RaffleDetailClient({
  raffleId,
  quotaPrice,
  availableQuotas,
  isOpen,
}: RaffleDetailClientProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const totalPrice = selectedQuantity * Number(quotaPrice)

  return (
    <>
      <QuotaSelector
        selectedQuantity={selectedQuantity}
        onSelect={setSelectedQuantity}
        availableQuotas={availableQuotas}
      />
      
      <div className="mt-8 bg-linear-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-2 border-emerald-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Total a Pagar</p>
            <p className="text-3xl font-black text-emerald-700">
              R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <button
onClick={() => setIsDrawerOpen(true)} disabled={!isOpen} className="w-full bg-emerald-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-black text-lg py-4 rounded-lg transition shadow-lg" > 🛒 Comprar Agora </button> <p className="text-xs text-gray-600 text-center mt-4">
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
          quotaPrice={quotaPrice}
          availableQuotas={availableQuotas}
          isOpen={isOpen}
          selectedQuantity={selectedQuantity}
        />
      </Drawer>
    </>
  )
}
