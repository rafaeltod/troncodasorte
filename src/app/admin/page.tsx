'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/admin-route'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatters'
import { Plus, Edit, Trash2, Eye, Users, TrendingUp, DollarSign, Award, Tag } from 'lucide-react'
import { mainConfig } from '../../lib/layout-config'

interface WinnerInfo {
  name: string
  cpf: string
  phone: string
  email: string
  winnerNumber: string
}

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
  winnerInfo?: WinnerInfo | null
  cliente: string
}

const formatCPF = (cpf: string | null | undefined) => {
  if (!cpf) return '—'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

const formatPhone = (phone: string | null | undefined) => {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 11) return phone
  return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
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
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
        <div className={mainConfig}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-cinza-escuro dark:text-amarelo-claro mb-3">
              Painel do Admin
            </h1>
            <p className="text-lg text-cinza dark:text-gray-400 mb-6">
              Gerencie todas os seus lotes em um só lugar
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/criar-lote"
                className="inline-flex items-center gap-2 bg-azul-royal dark:bg-azul-claro text-branco px-6 py-3 rounded-full font-bold transition transform hover:bg-branco dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal border shadow-lg"
              >
                <Plus size={20} /> Criar Novo Lote
              </Link>
              <Link
                href="/admin/cupons"
                className="inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-400 transition transform hover:scale-105 shadow-lg"
              >
                <Tag size={20} /> Gerenciar Cupons
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-branco dark:bg-[#232F3E] p-6 rounded-xl shadow-lg border-2 border-cinza-claro dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza dark:text-gray-400 font-bold">Total de Lotes</h3>
                <Award className="text-azul-royal dark:text-gray-400" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza-escuro dark:text-cinza-claro">{stats.total}</p>
            </div>

            <div className="bg-branco dark:bg-[#232F3E] p-6 rounded-xl shadow-lg border-2 border-cinza-claro dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza dark:text-gray-400 font-bold">Lotes Abertos</h3>
                <TrendingUp className="text-cinza dark:text-gray-400" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza dark:text-cinza-claro">{stats.open}</p>
            </div>

            <div className="bg-branco dark:bg-[#232F3E] p-6 rounded-xl shadow-lg border-2 border-cinza-claro dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza dark:text-gray-400 font-bold">Livros Vendidos</h3>
                <Users className="text-cinza dark:text-gray-400" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza dark:text-cinza-claro">{stats.totalSold}</p>
            </div>

            <div className="bg-branco dark:bg-[#232F3E] p-6 rounded-xl shadow-lg border-2 border-cinza-claro dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cinza dark:text-gray-400 font-bold">Receita Total</h3>
                <DollarSign className="text-cinza dark:text-gray-400" size={24} />
              </div>
              <p className="text-3xl font-black text-cinza dark:text-cinza-claro">{formatCurrency(stats.totalRevenue)}</p>
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
                    ? 'bg-azul-claro text-branco dark:bg-amarelo-claro dark:text-azul-royal'
                    : 'bg-branco dark:bg-amarelo-pastel text-azul-claro dark:text-azul-royal border-2 border-azul-claro dark:border-amarelo-claro hover:bg-azul-pastel dark:hover:bg-amarelo-claro'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lotes List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
            </div>
          ) : filteredLotes.length > 0 ? (
            <div className="bg-branco dark:bg-[#232F3E] rounded-xl shadow-lg overflow-hidden border-2 border-cinza-claro dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-fundo-cinza dark:bg-[#1a2332] border-b-2 border-cinza-claro dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Lote</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Prêmio</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Livros</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Participantes</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Receita</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cinza-escuro dark:text-cinza-claro">Ganhador</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-cinza-escuro dark:text-cinza-claro">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cinza-claro dark:divide-gray-700">
                    {filteredLotes.map((lote) => (
                      <tr key={lote.id} className="hover:bg-fundo-cinza dark:hover:bg-[#1a2332] transition">
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
                              <p className="font-bold text-cinza dark:text-cinza-claro">{lote.title}</p>
                              <p className="text-sm text-fundo-cinza0 dark:text-gray-500">
                                {new Date(lote.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(lote.status)}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-azul-royal dark:text-azul-pastel">
                            {lote.prizeAmount > 0 ? formatCurrency(lote.prizeAmount) : 'Item'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-bold text-cinza dark:text-cinza-claro">
                              {lote.soldLivros}/{lote.totalLivros}
                            </p>
                            <div className="w-20 h-2 bg-cinza-claro dark:bg-gray-700 rounded-full mt-1">
                              <div
                                className="h-full bg-amarelo-gold dark:bg-yellow-500 rounded-full"
                                style={{
                                  width: `${(lote.soldLivros / lote.totalLivros) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-azul-claro dark:text-azul-pastel">{lote.participants}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-cinza dark:text-cinza-claro">
                            {formatCurrency(lote.soldLivros * lote.livroPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {lote.winnerInfo ? (
                            <div className="text-sm min-w-[180px]">
                              <p className="font-bold text-cinza-escuro dark:text-amarelo-claro">{lote.winnerInfo.name}</p>
                              <p className="text-xs text-cinza dark:text-azul-pastel font-semibold mt-0.5">{formatCPF(lote.winnerInfo.cpf)}</p>
                              <p className="text-xs text-cinza dark:text-azul-pastel font-semibold">{formatPhone(lote.winnerInfo.phone)}</p>
                              <p className="text-xs text-cinza dark:text-azul-pastel font-semibold">{lote.winnerInfo.email || '—'}</p>
                              <p className="text-xs text-cinza dark:text-azul-pastel font-semibold">Bilhete: {lote.winnerInfo.winnerNumber || '—'}</p>
                            </div>
                          ) : (
                            <span className="text-cinza text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${lote.cliente || 'troncodasorte'}/lotes/${lote.id}`}
                              className="p-2 text-azul-claro hover:bg-azul-pastel dark:text-amarelo-claro dark:hover:text-amarelo-gold dark:hover:bg-amarelo-pastel rounded-lg transition"
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
            <div className="text-center py-16 bg-branco dark:bg-[#232F3E] rounded-2xl border-2 border-dashed border-cinza-claro dark:border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold text-cinza dark:text-cinza-claro mb-2">
                Nenhuma lote encontrada
              </h3>
              <p className="text-cinza dark:text-gray-400 mb-6">
                Comece criando sua primeira lote!
              </p>
              <Link
                href="/criar-lote"
                className="inline-flex items-center gap-2 bg-azul-royal dark:bg-azul-claro text-branco px-6 py-3 rounded-xl font-bold hover:bg-azul-claro dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal transition"
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
