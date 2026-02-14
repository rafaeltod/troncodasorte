'use client'

import { FinalizarLoteButton } from './finalizar-lote-button'
import { useAuth } from '@/context/auth-context'
import { Settings } from 'lucide-react'

interface AdminLoteActionsProps {
  raffleId: string
  raffleStatus: string
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
    </div>
  )
}
