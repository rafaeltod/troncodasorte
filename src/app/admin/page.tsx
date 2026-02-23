'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/admin-route'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatters'
import { Plus, Edit, Trash2, Eye, Users, TrendingUp, DollarSign, Award } from 'lucide-react'
import { mainConfig } from '../../lib/layout-config'

interface Lote {
  id: string
  title: string
  description: string
  prizeAmount: number
  livroPrice: number
  totalLivros: number
  soldLivros: number
  status: string
  image?: string
  createdAt: string
  participants: number
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'finished'>('all')

  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      fetchLotes()
    }
  }, [authLoading, user])

  const fetchLotes = async () => {
    try {
      const response = await fetch('/api/admin/lotes', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', {
          status: response.status,
          error: errorData.error || 'Erro ao buscar lotes'
        })
        throw new Error(errorData.error || 'Erro ao buscar lotes')
      }

      const data = await response.json()
      setLotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar lotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta lote? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/lotes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar lote')
      }

      alert('Lote deletada com sucesso!')
      fetchLotes()
    } catch (error) {
      console.error('Erro ao deletar lote:', error)
      alert('Erro ao deletar lote')
    }
  }

  const filteredLotes = lotes.filter((c) => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const stats = {
    total: lotes.length,
    open: lotes.filter((c) => c.status === 'open').length,
    closed: lotes.filter((c) => c.status === 'closed').length,
    finished: lotes.filter((c) => c.status === 'finished').length,
    totalSold: lotes.reduce((sum, c) => sum + c.soldLivros, 0),
    totalRevenue: lotes.reduce((sum, c) => sum + (c.soldLivros * c.livroPrice), 0),
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-verde-pastel text-verde-menta',
      closed: 'bg-vermelho-pastel text-vermelho-vivo',
      finished: 'bg-cinza-claro text-cinza-escuro',
    }
    const labels = {
      open: 'Aberta',
      closed: 'Fechada',
      finished: 'Finalizada',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${badges[status as keyof typeof badges] || 'bg-cinza-claro text-cinza-escuro'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-fundo-cinza py-12">
        <div className={mainConfig}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-cinza-escuro mb-3">
              Painel do Admin
            </h1>
            <p className="text-lg text-cinza mb-6">
              Gerencie todas os seus lotes em um só lugar
            </p>

            <Link
              href="/criar-lote"
              className="inline-flex items-center gap-2 bg-azul-royal text-branco px-6 py-3 rounded-full font-bold transition transform hover:bg-branco hover:text-azul-royal border shadow-lg"
            >
              <Plus size={20} /> Criar Novo Lote
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-branco p-6 rounded-xl shadow-lg border-2 border-cinza-claro">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza font-bold">Total de Lotes</h3>
                <Award className="text-azul-royal" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza-escuro">{stats.total}</p>
            </div>

            <div className="bg-branco p-6 rounded-xl shadow-lg border-2 border-cinza-claro">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza font-bold">Lotes Abertos</h3>
                <TrendingUp className="text-cinza" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza">{stats.open}</p>
            </div>

            <div className="bg-branco p-6 rounded-xl shadow-lg border-2 border-cinza-claro">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza font-bold">Livros Vendidos</h3>
                <Users className="text-cinza" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza">{stats.totalSold}</p>
            </div>

            <div className="bg-branco p-6 rounded-xl shadow-lg border-2 border-cinza-claro">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza font-bold">Receita Total</h3>
                <DollarSign className="text-cinza" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: 'all', label: `Todos (${stats.total})` },
              { id: 'open', label: `Abertos (${stats.open})` },
              { id: 'closed', label: `Fechados (${stats.closed})` },
              { id: 'finished', label: `Finalizados (${stats.finished})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 md:px-6 md:py-2 cursor-pointer rounded-full font-bold transition ${
                  filter === f.id
                    ? 'bg-azul-claro text-branco'
                    : 'bg-branco text-azul-claro border-2 border-azul-claro hover:bg-azul-pastel'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lotes List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-xl font-bold text-cinza">Carregando...</div>
            </div>
          ) : filteredLotes.length > 0 ? (
            <div className="bg-branco rounded-xl shadow-lg overflow-hidden border-2 border-cinza-claro">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-fundo-cinza border-b-2 border-cinza-claro">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Lote</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Prêmio</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Livros</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Participantes</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro">Receita</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-cinza-escuro">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cinza-claro">
                    {filteredLotes.map((lote) => (
                      <tr key={lote.id} className="hover:bg-fundo-cinza transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {lote.image && (
                              <img
                                src={lote.image}
                                alt={lote.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-cinza">{lote.title}</p>
                              <p className="text-sm text-fundo-cinza0">
                                {new Date(lote.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(lote.status)}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-azul-royal">
                            {lote.prizeAmount > 0 ? formatCurrency(lote.prizeAmount) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-bold text-cinza">
                              {lote.soldLivros}/{lote.totalLivros}
                            </p>
                            <div className="w-20 h-2 bg-cinza-claro rounded-full mt-1">
                              <div
                                className="h-full bg-amarelo-gold rounded-full"
                                style={{
                                  width: `${(lote.soldLivros / lote.totalLivros) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-azul-claro">{lote.participants}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-cinza">
                            {formatCurrency(lote.soldLivros * lote.livroPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/lotes/${lote.id}`}
                              className="p-2 text-azul-claro hover:bg-azul-pastel rounded-lg transition"
                              title="Ver lote"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/lotes/${lote.id}/editar`}
                              className="p-2 text-verde-agua hover:bg-verde-pastel rounded-lg transition"
                              title="Editar lote"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(lote.id)}
                              className="p-2 text-vermelho-vivo hover:bg-vermelho-pastel rounded-lg transition"
                              title="Deletar lote"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-branco rounded-2xl border-2 border-dashed border-cinza-claro shadow-lg">
              <h3 className="text-2xl font-bold text-cinza mb-2">
                Nenhuma lote encontrada
              </h3>
              <p className="text-cinza mb-6">
                Comece criando sua primeira lote!
              </p>
              <Link
                href="/criar-lote"
                className="inline-flex items-center gap-2 bg-azul-royal text-branco px-6 py-3 rounded-xl font-bold hover:bg-azul-claro transition"
              >
                <Plus size={20} /> Criar Lote
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  )
}
