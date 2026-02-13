'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/admin-route'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatters'
import { Plus, Edit, Trash2, Eye, Users, TrendingUp, DollarSign, Award } from 'lucide-react'

interface Campanha {
  id: string
  title: string
  description: string
  prizeAmount: number
  quotaPrice: number
  totalQuotas: number
  soldQuotas: number
  status: string
  image?: string
  createdAt: string
  participants: number
}

export default function AdminDashboardPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'finished'>('all')

  useEffect(() => {
    fetchCampanhas()
  }, [])

  const fetchCampanhas = async () => {
    try {
      const response = await fetch('/api/admin/campanhas', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', {
          status: response.status,
          error: errorData.error || 'Erro ao buscar campanhas'
        })
        throw new Error(errorData.error || 'Erro ao buscar campanhas')
      }

      const data = await response.json()
      setCampanhas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/campanhas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar campanha')
      }

      alert('Campanha deletada com sucesso!')
      fetchCampanhas()
    } catch (error) {
      console.error('Erro ao deletar campanha:', error)
      alert('Erro ao deletar campanha')
    }
  }

  const filteredCampanhas = campanhas.filter((c) => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const stats = {
    total: campanhas.length,
    open: campanhas.filter((c) => c.status === 'open').length,
    closed: campanhas.filter((c) => c.status === 'closed').length,
    finished: campanhas.filter((c) => c.status === 'finished').length,
    totalSold: campanhas.reduce((sum, c) => sum + c.soldQuotas, 0),
    totalRevenue: campanhas.reduce((sum, c) => sum + (c.soldQuotas * c.quotaPrice), 0),
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-yellow-100 text-yellow-800',
      finished: 'bg-gray-100 text-gray-800',
    }
    const labels = {
      open: '🟢 Aberta',
      closed: '🟡 Fechada',
      finished: '⚫ Finalizada',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Painel do Vendedor
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Gerencie todas as suas campanhas em um só lugar
            </p>

            <Link
              href="/criar-campanha"
              className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} /> Criar Nova Campanha
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-bold">Total de Campanhas</h3>
                <Award className="text-emerald-600" size={24} />
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-bold">Campanhas Abertas</h3>
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-black text-green-600">{stats.open}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-bold">Cotas Vendidas</h3>
                <Users className="text-blue-600" size={24} />
              </div>
              <p className="text-3xl font-black text-blue-600">{stats.totalSold}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-bold">Receita Total</h3>
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <p className="text-3xl font-black text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: 'all', label: `Todas (${stats.total})` },
              { id: 'open', label: `Abertas (${stats.open})` },
              { id: 'closed', label: `Fechadas (${stats.closed})` },
              { id: 'finished', label: `Finalizadas (${stats.finished})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Campanhas List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
            </div>
          ) : filteredCampanhas.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Campanha</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Prêmio</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Cotas</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Participantes</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Receita</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCampanhas.map((campanha) => (
                      <tr key={campanha.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {campanha.image && (
                              <img
                                src={campanha.image}
                                alt={campanha.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{campanha.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(campanha.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(campanha.status)}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(campanha.prizeAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-bold text-gray-900">
                              {campanha.soldQuotas}/{campanha.totalQuotas}
                            </p>
                            <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{
                                  width: `${(campanha.soldQuotas / campanha.totalQuotas) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-blue-600">{campanha.participants}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(campanha.soldQuotas * campanha.quotaPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/campanhas/${campanha.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Ver campanha"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/campanhas/${campanha.id}/editar`}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Editar campanha"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(campanha.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Deletar campanha"
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
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira campanha!
              </p>
              <Link
                href="/criar-campanha"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                <Plus size={20} /> Criar Campanha
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  )
}
