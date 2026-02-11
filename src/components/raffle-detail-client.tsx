'use client'

import { useState } from 'react'
import { QuotaSelector } from './quota-selector'
import { CheckoutFlow } from './checkout-flow'

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

  return (
    <>
      <QuotaSelector
        selectedQuantity={selectedQuantity}
        onSelect={setSelectedQuantity}
        availableQuotas={availableQuotas}
      />
      <div className="mt-8">
        <CheckoutFlow
          raffleId={raffleId}
          quotaPrice={quotaPrice}
          availableQuotas={availableQuotas}
          isOpen={isOpen}
          selectedQuantity={selectedQuantity}
        />
      </div>
    </>
  )
}
