'use client'

import { useState } from 'react'
import { X, Copy, CheckCircle2 } from 'lucide-react'

interface PixPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseId: string
  amount: number
  raffleId: string
  onPaymentConfirmed?: () => void
}

export function PixPaymentModal({
  isOpen,
  onClose,
  purchaseId,
  amount,
  raffleId,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const generatePixQR = async () => {
    setLoading(true)
    try {
      // Se vier do histórico (raffleId vazio), fazer GET na compra existente
      if (!raffleId) {
        const response = await fetch(`/api/payment/pix/${purchaseId}`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Erro ao recuperar QR code')
        }

        const data = await response.json()
        setPixData(data)
      } else {
        // Se vier da compra (raffleId preenchido), fazer POST para nova compra
        const response = await fetch('/api/payment/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            purchaseId,
            amount,
            raffleId,
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao gerar QR code')
        }

        const data = await response.json()
        setPixData(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao gerar/recuperar QR code PIX')
    } finally {
      setLoading(false)
    }
  }

  const copyPixKey = () => {
    if (pixData?.pixKey) {
      navigator.clipboard.writeText(pixData.pixKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Pagamento PIX</h2>
            <p className="text-sm text-gray-600 mt-1">Mercado Pago</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!pixData ? (
            <>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                <p className="text-sm text-gray-700 mb-3">
                  💰 <span className="font-bold">Valor a pagar:</span> R$ {amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  Clique em "Gerar QR Code" para escanear com seu celular e realizar o pagamento via PIX.
                </p>
              </div>

              <button
                onClick={generatePixQR}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Gerando QR Code...' : '📱 Gerar QR Code PIX'}
              </button>
            </>
          ) : (
            <>
              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  <img
                    src={pixData.qrCode}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22white%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22black%22%3EPIX QR Code%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>

                <div className="w-full">
                  <p className="text-xs font-bold text-gray-600 mb-2">OU COPIE A CHAVE:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixData.pixKey || ''}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-mono"
                    />
                    <button
                      onClick={copyPixKey}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-bold">
                    ℹ️ Transação ID: <span className="font-mono text-xs">{pixData.transactionId}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Sua compra será confirmada em até alguns minutos após o pagamento.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-bold transition"
              >
                ✅ Entendi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
