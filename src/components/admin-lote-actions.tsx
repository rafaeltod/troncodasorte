'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Settings, XCircle, Loader2, CheckCircle2, Trophy, Hash } from 'lucide-react'

interface AdminLoteActionsProps {
  raffleId: string
  raffleStatus: string
}

interface ResultadoData {
  drawnNumber: string
  winnerNumber: string
  incrementos: number
  winner: {
    userId: string
    name: string
    email: string
    purchaseId: string
  }
}

function FinalizarLoteButton({ 
  raffleId, 
  raffleStatus,
  onFinalized 
}: {
  raffleId: string
  raffleStatus: string
  onFinalized?: () => void
}) {
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

export function AdminLoteActions({ raffleId, raffleStatus }: AdminLoteActionsProps) {
  const { user } = useAuth()

  // Só exibir para admins
  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-2 text-amber-700 font-bold mb-4">
        <Settings className="w-5 h-5" />
        Ações de Administrador
      </div>
      
      <div className="flex flex-wrap gap-3">
        <a
          href={`/admin/lotes/${raffleId}/editar`}
          className="flex-1 min-w-[140px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-2 px-4 rounded-lg transition text-center"
        >
          ✏️ Editar
        </a>
      </div>
      
      <FinalizarLoteButton 
        raffleId={raffleId} 
        raffleStatus={raffleStatus}
      />

      <CadastrarResultadoButton
        raffleId={raffleId}
        raffleStatus={raffleStatus}
      />
    </div>
  )
}

function CadastrarResultadoButton({
  raffleId,
  raffleStatus,
}: {
  raffleId: string
  raffleStatus: string
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [drawnNumber, setDrawnNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoData | null>(null)

  // Só exibir para admins e se a campanha está fechada (pronta para sorteio)
  if (!user?.isAdmin || raffleStatus !== 'closed') {
    return null
  }

  const handleInputChange = (value: string) => {
    // Aceitar apenas dígitos, máximo 6
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setDrawnNumber(cleaned)
  }

  const handleCadastrarResultado = async () => {
    if (drawnNumber.length === 0) {
      setError('Informe o número do sorteio')
      return
    }

    const numberPadded = drawnNumber.padStart(6, '0')

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/lotes/${raffleId}/resultado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drawnNumber: numberPadded }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar resultado')
      }

      setResultado(data.resultado)
      setShowForm(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return (
      <div className="mt-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6">
        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
          <Trophy className="w-5 h-5" />
          Resultado Cadastrado!
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-500 mb-1">Número sorteado (digitado)</p>
            <p className="text-2xl font-mono font-bold text-gray-800">{resultado.drawnNumber}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-500 mb-1">Número vencedor (correspondente)</p>
            <p className="text-2xl font-mono font-bold text-emerald-600">{resultado.winnerNumber}</p>
            {resultado.incrementos > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                +{resultado.incrementos} incremento{resultado.incrementos > 1 ? 's' : ''} a partir do número sorteado
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-500 mb-1">Ganhador</p>
            <p className="text-lg font-bold text-gray-800">{resultado.winner.name}</p>
            <p className="text-sm text-gray-500">{resultado.winner.email}</p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          Recarregar Página
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          Cadastrar Resultado do Sorteio
        </button>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
          <p className="text-emerald-700 font-semibold mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Informe o número do sorteio
          </p>
          <p className="text-emerald-600 text-sm mb-4">
            Digite o número entre 000000 e 999999. O sistema irá verificar se existe um bilhete correspondente.
            Caso não exista, será feito o incremento automático até encontrar um bilhete válido.
          </p>

          <div className="mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={drawnNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] bg-white border-2 border-emerald-300 rounded-lg py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-800 placeholder-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              {drawnNumber.length}/6 dígitos — será completado com zeros à esquerda
            </p>
          </div>

          {error && (
            <p className="text-red-700 bg-red-100 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCadastrarResultado}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando bilhete...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Cadastrar Resultado
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setError(null)
                setDrawnNumber('')
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
