'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Users, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  isAdmin: boolean
  isVendedor: boolean
  createdAt: string
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!authUser || !authUser.isAdmin) {
      router.push('/')
      return
    }

    fetchUsers()
  }, [authUser, authLoading, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }

  const toggleVendedor = async (userId: string) => {
    try {
      setError('')
      setSuccess('')

      const response = await fetch(`/api/admin/users/${userId}/toggle-vendedor`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário')
      }

      const data = await response.json()
      setSuccess(data.message)
      
      // Atualizar lista
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isVendedor: data.isVendedor } : u
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-fundo-cinza flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-azul-royal animate-spin" />
      </div>
    )
  }

  if (!authUser?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-fundo-cinza py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-cinza-escuro mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-azul-royal" />
            Gerenciar Usuários
          </h1>
          <p className="text-cinza">Controle de permissões de vendedores</p>
        </div>

        {error && (
          <div className="bg-vermelho-pastel text-vermelho-vivo p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-verde-pastel text-verde-agua p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-branco rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-azul-royal text-branco">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Nome</th>
                  <th className="px-6 py-4 text-left font-bold">Email</th>
                  <th className="px-6 py-4 text-left font-bold">Telefone</th>
                  <th className="px-6 py-4 text-center font-bold">Admin</th>
                  <th className="px-6 py-4 text-center font-bold">Vendedor</th>
                  <th className="px-6 py-4 text-center font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-cinza-claro hover:bg-azul-pastel/20 transition ${
                      index % 2 === 0 ? 'bg-fundo-cinza/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-cinza-escuro">{user.name}</p>
                      <p className="text-xs text-cinza">{user.cpf}</p>
                    </td>
                    <td className="px-6 py-4 text-cinza">{user.email}</td>
                    <td className="px-6 py-4 text-cinza">{user.phone}</td>
                    <td className="px-6 py-4 text-center">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amarelo-gold/20 text-amarelo-gold rounded-full text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-cinza text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isVendedor ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-verde-pastel text-verde-agua rounded-full text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          Vendedor
                        </span>
                      ) : (
                        <span className="text-cinza text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!user.isAdmin && (
                        <button
                          onClick={() => toggleVendedor(user.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                            user.isVendedor
                              ? 'bg-vermelho-pastel text-vermelho-vivo hover:bg-vermelho-vivo hover:text-branco'
                              : 'bg-verde-pastel text-verde-agua hover:bg-verde-agua hover:text-branco'
                          }`}
                        >
                          {user.isVendedor ? (
                            <>
                              <ShieldOff className="w-4 h-4" />
                              Remover
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Tornar Vendedor
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-cinza-claro mx-auto mb-4" />
              <p className="text-cinza">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
