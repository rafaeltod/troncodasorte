'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { XCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface FinalizarLoteButtonProps {
  raffleId: string
  raffleStatus: string
  onFinalized?: () => void
}

export function FinalizarLoteButton({ 
  raffleId, 
  raffleStatus,
  onFinalized 
}: FinalizarLoteButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Só exibir para admins e se a campanha está aberta
  if (!user?.isAdmin || raffleStatus !== 'open') {
    return null
  }

  const handleFinalizar = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/lotes/${raffleId}/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao finalizar campanha')
      }

      setSuccess(true)
      setShowConfirm(false)
      
      // Recarregar a página após 1.5 segundos
      setTimeout(() => {
        if (onFinalized) {
          onFinalized()
        } else {
          window.location.reload()
        }
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 font-bold">
        <CheckCircle2 className="w-5 h-5" />
        Campanha finalizada com sucesso!
      </div>
    )
  }

  return (
    <div className="mt-6">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          Finalizar Lote
        </button>
      ) : (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-semibold mb-4">
            ⚠️ Tem certeza que deseja finalizar esta campanha?
          </p>
          <p className="text-red-600 text-sm mb-4">
            Após finalizada, não será mais possível comprar livros nesta lote.
          </p>
          
          {error && (
            <p className="text-red-700 bg-red-100 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleFinalizar}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                'Sim, Finalizar'
              )}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false)
                setError(null)
              }}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
