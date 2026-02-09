'use client'

import { useState, useEffect } from 'react'
import { X, Copy, CheckCircle2 } from 'lucide-react'
import QRCode from 'qrcode'
import { usePurchaseStatus } from '@/hooks/use-purchase-status'

interface PixPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseId: string
  amount: number
  raffleId: string
  onPaymentConfirmed?: () => void
  onCanceled?: () => void
}

export function PixPaymentModal({
  isOpen,
  onClose,
  purchaseId,
  amount,
  raffleId,
  onPaymentConfirmed,
  onCanceled,
}: PixPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  // Rastrear o amount que veio do backend (funciona pfv)
  const [backendAmount, setBackendAmount] = useState<number | null>(null)
  const [canceling, setCanceling] = useState(false)

  // Polling para confirmar pagamento
  const { status: purchaseStatus, retryCount } = usePurchaseStatus({
    purchaseId,
    raffleId,
    onConfirmed: onPaymentConfirmed,
    // Não chamar onCanceled aqui para evitar confusão com cancelamento manual
    enabled: isOpen && !!pixData, // Só faz polling quando modal está aberto e QR foi gerado
  })

  // ✅ Resetar pixData e backendAmount quando purchaseId mudar
  // Isso garante que cada nova compra começa com estado limpo
  useEffect(() => {
    setPixData(null)
    setBackendAmount(null)
    setCopied(false)
  }, [purchaseId])

  const generatePixQR = async () => {
    setLoading(true)
    try {
      if (!raffleId) {
        const response = await fetch(`/api/payment/pix/${purchaseId}`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Erro ao recuperar QR code')
        }

        const data = await response.json()
        setPixData(data)
        if (data.amount) {
          setBackendAmount(Number(data.amount))
        }
      } else {
       
        const response = await fetch('/api/payment/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            purchaseId,
            raffleId,
          }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Erro ao gerar QR code')
        }

        const data = await response.json()

          // Se o backend já retornou um qrCode pronto, usar direto
          if (data.qrCode && typeof data.qrCode === 'string' && data.qrCode.startsWith('data:')) {
            // Já é um data URL válido, usar direto
            console.log('[PixPaymentModal] QR Code já vem do backend')
          } else if (!data.qrCode && (data.content || data.pixKey)) {
            // Se não tem qrCode mas tem content (BR Code), gerar localmente
            const payload = data.content || data.pixKey
            const isEmail = /\S+@\S+\.\S+/.test(payload)
            const FORCE_QR = process.env.NEXT_PUBLIC_FORCE_QR === 'true'
          
            if (isEmail && !FORCE_QR) {
              console.log('[PixPaymentModal] Payload é email, não gerando QR automaticamente')
              data.qrCode = null
            } else {
              try {
                console.log('[PixPaymentModal] Gerando QR code localmente')
                const svgString = await QRCode.toString(payload, { type: 'svg', width: 300 })
                data.qrCode = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString)
              } catch (err) {
                console.error('[PixPaymentModal] Erro ao gerar QR localmente:', err)
                data.qrCode = null
              }
            }
          }

        setPixData(data)
        // ✅ Setar o amount validado do backend (tanto no POST quanto no GET)
        if (data.amount) {
          setBackendAmount(Number(data.amount))
        }
      }
    } catch (error) {
      console.error('Error:', error)
        alert(error instanceof Error ? error.message : 'Erro ao gerar/recuperar QR code PIX')
    } finally {
      setLoading(false)
    }
  }

  const copyPixKey = () => {
    const key = pixData?.pixKey || pixData?.content || ''
    if (key) {
      navigator.clipboard.writeText(key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const cancelPurchase = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta compra? As cotas serão devolvidas à rifa.')) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch(`/api/rifas/${raffleId}/purchase/${purchaseId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao cancelar compra')
      }

      console.log('[PixPaymentModal] Compra cancelada com sucesso')
      onCanceled?.()
      onClose()
    } catch (error) {
      console.error('[PixPaymentModal] Erro ao cancelar:', error)
      alert(error instanceof Error ? error.message : 'Erro ao cancelar compra')
    } finally {
      setCanceling(false)
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
                  💰 <span className="font-bold">Valor a pagar:</span> R$ {(backendAmount || amount).toFixed(2)}
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
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 flex items-center justify-center w-full">
                  {pixData.qrCode ? (
                    <img
                      src={pixData.qrCode}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22white%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22black%22%3EPIX QR Code%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full p-6 text-center text-sm text-gray-600">
                      <p className="font-semibold">QR indisponível</p>
                      <p className="mt-2">Use a chave abaixo para pagar via PIX</p>
                    </div>
                  )}
                </div>

                {/* Copiar chave - sempre mostrar abaixo do QR */}
                <div className="w-full">
                  <p className="text-xs font-bold text-gray-600 mb-2">OU COPIE A CHAVE:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixData.content || pixData.pixKey || ''}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm text-black bg-gray-50 border border-gray-300 rounded-lg font-mono"
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
                   Transação ID: <span className="font-mono text-xs">{pixData.transactionId}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Sua compra será confirmada em até alguns minutos após o pagamento.
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-blue-500 mt-2">
                      🔄 Verificando... ({retryCount})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-bold transition"
              >
                Entendi
              </button>

              <button
                onClick={cancelPurchase}
                disabled={canceling}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-lg font-bold transition border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canceling ? '⏳ Cancelando...' : '❌ Cancelar Compra'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
