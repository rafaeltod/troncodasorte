import { useEffect, useState } from 'react'

interface UsePurchaseStatusProps {
  purchaseId: string
  raffleId: string
  onConfirmed?: () => void
  onCanceled?: () => void
  enabled?: boolean
}

export function usePurchaseStatus({
  purchaseId,
  raffleId,
  onConfirmed,
  onCanceled,
  enabled = true,
}: UsePurchaseStatusProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const checkStatus = async () => {
    if (!purchaseId || !raffleId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/rifas/${raffleId}/purchase/${purchaseId}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[usePurchaseStatus] Compra cancelada')
          setStatus('cancelled')
          onCanceled?.()
          return
        }
        throw new Error('Erro ao buscar status')
      }

      const data = await response.json()
      console.log('[usePurchaseStatus] Status:', data.status)

      setStatus(data.status)
      setError(null)

      if (data.status === 'confirmed') {
        console.log('[usePurchaseStatus] ✅ Compra confirmada!')
        onConfirmed?.()
      }
    } catch (err) {
      console.error('[usePurchaseStatus] Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled || !purchaseId || !raffleId) return

    // Fazer check imediato
    checkStatus()

    // Polling a cada 3 segundos (máximo 40 tentativas = 2 minutos)
    const interval = setInterval(() => {
      setRetryCount((prev) => prev + 1)

      if (retryCount >= 40) {
        console.log('[usePurchaseStatus] Timeout - parando polling')
        clearInterval(interval)
        return
      }

      checkStatus()
    }, 3000)

    return () => clearInterval(interval)
  }, [enabled, purchaseId, raffleId, retryCount])

  return {
    status,
    loading,
    error,
    retryCount,
  }
}
