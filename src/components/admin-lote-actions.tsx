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
      
      <FinalizarLoteButton 
        raffleId={raffleId} 
        raffleStatus={raffleStatus}
      />
    </div>
  )
}
