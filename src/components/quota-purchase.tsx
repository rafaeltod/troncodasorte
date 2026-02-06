'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { PixPaymentModal } from './pix-payment-modal'
import { Ticket, Minus, Plus } from 'lucide-react'

interface QuotaPurchaseProps {
  raffleId: string
  quotaPrice: number
  availableQuotas: number
  isOpen: boolean
}

export function QuotaPurchase({
  raffleId,
  quotaPrice,
  availableQuotas,
  isOpen,
}: QuotaPurchaseProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)

  const numericQuotaPrice = Number(quotaPrice)
  const totalPrice = quantity * numericQuotaPrice

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= availableQuotas) {
      setQuantity(newQuantity)
    }
  }

  const handlePurchase = async () => {
    setError('')

    if (!user) {
      // Redirecionar para login
      router.push('/auth/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/rifas/${raffleId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quotas: quantity,
          amount: totalPrice,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao processar compra')
      }

      const data = await response.json()
      
      // Armazenar ID da compra e mostrar modal de pagamento
      setPurchaseId(data.purchaseId)
      setShowPaymentModal(true)
    } catch (err) {
      console.error('[QuotaPurchase] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar compra')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentConfirmed = () => {
    setShowPaymentModal(false)
    setPurchaseId(null)
    alert('✅ Pagamento recebido! Sua compra foi confirmada.')
    router.push('/historico')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-20">
      <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Ticket className="w-6 h-6 text-emerald-600" />
        Selecione a quantidade
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Quantidade de Cotas
          </label>
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || loading}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Minus className="w-5 h-5 text-gray-700" />
            </button>
            <input
              type="number"
              min="1"
              max={availableQuotas}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              disabled={loading}
              className="flex-1 text-center text-2xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= availableQuotas || loading}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {availableQuotas} cotas disponíveis
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-semibold">numericQalor da cota:</span>
              <span className="text-gray-900 font-bold">R$ {quotaPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-semibold">Quantidade:</span>
              <span className="text-gray-900 font-bold">{quantity}x</span>
            </div>
            <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between">
              <span className="text-gray-900 font-black">Total:</span>
              <span className="text-2xl font-black text-emerald-700">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading || quantity === 0 || !isOpen}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Processando...
            </>
          ) : user ? (
            <>
              <Ticket className="w-5 h-5" />
              💳 Comprar Agora
            </>
          ) : (
            <>
              <Ticket className="w-5 h-5" />
              🔓 Fazer Login para Comprar
            </>
          )}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Para completar a compra, você precisará fazer login em seguida
        </p>
      </div>

      {/* PIX Payment Modal */}
      <PixPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        purchaseId={purchaseId || ''}
        amount={totalPrice}
        raffleId={raffleId}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </div>
  )
}
