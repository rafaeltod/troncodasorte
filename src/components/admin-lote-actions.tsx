'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Settings, XCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface AdminLoteActionsProps {
  raffleId: string
  raffleStatus: string
  onFinalized?: () => void
}

export function AdminLoteActions({ raffleId, raffleStatus, onFinalized }: AdminLoteActionsProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Só exibir para admins
  if (!user?.isAdmin) {
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

  return (
    <div className=" rounded-xl mt-6">
      <div className="flex items-center gap-2 text-vermelho-claro font-bold mb-4">
        <Settings className="w-5 h-5" />
        Ações de Administrador
      </div>
      
      <div className="flex flex-wrap gap-3">
        <a
          href={`/admin/lotes/${raffleId}/editar`}
          className="flex-1 min-w-35 bg-branco border border-vermelho-claro hover:bg-vermelho-claro hover:text-branco text-vermelho-claro font-semibold py-2 px-4 rounded-full transition text-center"
        >Editar
        </a>
      </div>

      {/* Finalizar Lote Section */}
      {raffleStatus === 'open' && (
        <div className="mt-6">
          {!success ? (
            <>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-vermelho-claro hover:bg-vermelho-vivo rounded-full cursor-pointer text-branco font-bold py-3 px-6 transition flex items-center justify-center gap-2"
                >
                  Finalizar Lote
                </button>
              ) : (
                <div className="bg-amarelo-pastel rounded-xl p-6">
                  <p className="text-vermelho-vivo font-semibold mb-4">
                    Tem certeza que deseja finalizar esta campanha?
                  </p>
                  <p className="text-vermelho-vivo text-sm mb-4">
                    Após finalizada, não será mais possível comprar livros nesta lote.
                  </p>
                  
                  {error && (
                    <p className="text-vermelho-vivo bg-vermelho-pastel px-4 py-2 rounded mb-4 text-sm">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleFinalizar}
                      disabled={loading}
                      className="flex-1 bg-vermelho-claro rounded-full cursor-pointer hover:bg-vermelho-vivo disabled:bg-vermelho-claro text-branco font-bold py-3 px-4 transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4  animate-spin" />
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
                      className="flex-1 bg-cinza-claro hover:bg-cinza-escuro hover:text-branco cursor-pointer text-gray-700 font-bold py-3 px-4 rounded-full transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Campanha finalizada com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
