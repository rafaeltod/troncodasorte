'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/admin-route'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatters'
import { Plus, Edit, Trash2, Tag, Users, Eye, DollarSign, ArrowLeft, Copy, Check, X, Search, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'

interface Cupom {
  id: string
  code: string
  discount: number
  tipoDesconto: string
  vendedorId: string
  loteId: string | null
  comissao: number
  description: string | null
  ativo: boolean
  createdAt: string
  vendedor: { id: string; name: string; email: string }
  lote: { id: string; title: string } | null
  totalAcessos: number
  totalUsos: number
  totalUsosConfirmados: number
}

interface UserOption {
  id: string
  name: string
  email: string
  cpf: string
  isVendedor: boolean
}

interface LoteOption {
  id: string
  title: string
}

export default function AdminCuponsPage() {
  const { user, loading: authLoading } = useAuth()
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [lotes, setLotes] = useState<LoteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchUser, setSearchUser] = useState('')
  const [expandedCupom, setExpandedCupom] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<any>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    tipoDesconto: 'percentual',
    vendedorId: '',
    loteId: '',
    comissao: 0,
    description: '',
  })

  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      fetchCupons()
      fetchUsers()
      fetchLotes()
    }
  }, [authLoading, user])

  const fetchCupons = async () => {
    try {
      const res = await fetch('/api/admin/cupons', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCupons(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const fetchLotes = async () => {
    try {
      const res = await fetch('/api/admin/lotes', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLotes(Array.isArray(data) ? data.map((l: any) => ({ id: l.id, title: l.title })) : [])
      }
    } catch (error) {
      console.error('Erro ao buscar lotes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCupom
        ? `/api/admin/cupons/${editingCupom.id}`
        : '/api/admin/cupons'
      const method = editingCupom ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          loteId: formData.loteId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar cupom')
        return
      }

      setShowForm(false)
      setEditingCupom(null)
      resetForm()
      fetchCupons()
    } catch (error) {
      console.error('Erro ao salvar cupom:', error)
      alert('Erro ao salvar cupom')
    }
  }

  const handleEdit = (cupom: Cupom) => {
    setEditingCupom(cupom)
    setFormData({
      code: cupom.code,
      discount: cupom.discount,
      tipoDesconto: cupom.tipoDesconto,
      vendedorId: cupom.vendedorId,
      loteId: cupom.loteId || '',
      comissao: cupom.comissao,
      description: cupom.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) return

    try {
      const res = await fetch(`/api/admin/cupons/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        fetchCupons()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao deletar cupom')
      }
    } catch (error) {
      alert('Erro ao deletar cupom')
    }
  }

  const handleToggleAtivo = async (cupom: Cupom) => {
    try {
      const res = await fetch(`/api/admin/cupons/${cupom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ativo: !cupom.ativo }),
      })
      if (res.ok) {
        fetchCupons()
      }
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discount: 0,
      tipoDesconto: 'percentual',
      vendedorId: '',
      loteId: '',
      comissao: 0,
      description: '',
    })
  }

  const copyLink = (cupom: Cupom) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const loteParam = cupom.loteId ? `/lotes/${cupom.loteId}` : ''
    const link = `${baseUrl}${loteParam}?cupom=${cupom.code}`
    navigator.clipboard.writeText(link)
    setCopiedCode(cupom.id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const fetchDetalhe = async (cupomId: string) => {
    if (expandedCupom === cupomId) {
      setExpandedCupom(null)
      setDetalhe(null)
      return
    }

    setExpandedCupom(cupomId)
    setLoadingDetalhe(true)

    try {
      const res = await fetch(`/api/admin/cupons/${cupomId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setDetalhe(data)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhe:', error)
    } finally {
      setLoadingDetalhe(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.cpf.includes(searchUser)
  )

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Tag className="w-8 h-8 text-emerald-600" />
                  Gerenciar Cupons
                </h1>
                <p className="text-gray-600 mt-1">Crie e gerencie cupons de desconto para vendedores</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setEditingCupom(null); setShowForm(true) }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Cupom
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingCupom ? 'Editar Cupom' : 'Novo Cupom'}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditingCupom(null) }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Código */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Código do Cupom *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="EX: VENDEDOR10"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900 font-mono uppercase"
                      required
                    />
                  </div>

                  {/* Desconto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Desconto *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Tipo Desconto</label>
                      <select
                        value={formData.tipoDesconto}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoDesconto: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="fixo">Fixo (R$)</option>
                      </select>
                    </div>
                  </div>

                  {/* Comissão */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Comissão do Vendedor (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.comissao}
                      onChange={(e) => setFormData(prev => ({ ...prev, comissao: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Percentual da venda que o vendedor recebe como comissão</p>
                  </div>

                  {/* Vendedor */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Vendedor *</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Buscar por nome, email ou CPF..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900 text-sm"
                      />
                    </div>
                    <select
                      value={formData.vendedorId}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendedorId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900 mt-2"
                      required
                    >
                      <option value="">Selecione um vendedor</option>
                      {filteredUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) {u.isVendedor ? '⭐' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lote (opcional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Lote (opcional)</label>
                    <select
                      value={formData.loteId}
                      onChange={(e) => setFormData(prev => ({ ...prev, loteId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                    >
                      <option value="">Todos os lotes</option>
                      {lotes.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Se vazio, o cupom funciona em todos os lotes</p>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ex: Cupom para campanha de Natal"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition"
                    >
                      {editingCupom ? 'Salvar Alterações' : 'Criar Cupom'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingCupom(null) }}
                      className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-semibold">Total Cupons</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{cupons.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-semibold">Total Acessos</span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {cupons.reduce((s, c) => s + c.totalAcessos, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Total Usos</span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {cupons.reduce((s, c) => s + c.totalUsosConfirmados, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold">Ativos</span>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                {cupons.filter(c => c.ativo).length}
              </p>
            </div>
          </div>

          {/* Cupons List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">⏳ Carregando cupons...</p>
            </div>
          ) : cupons.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-200">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-bold">Nenhum cupom criado</p>
              <p className="text-gray-500 mt-2">Crie o primeiro cupom para vendedores</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cupons.map(cupom => (
                <div key={cupom.id} className={`bg-white rounded-xl shadow border ${cupom.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-black text-xl text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                          {cupom.code}
                        </span>
                        {!cupom.ativo && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                            INATIVO
                          </span>
                        )}
                        {cupom.discount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {cupom.tipoDesconto === 'percentual' ? `${cupom.discount}%` : `R$ ${cupom.discount}`} OFF
                          </span>
                        )}
                        {cupom.comissao > 0 && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                            {cupom.comissao}% comissão
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-semibold">Vendedor:</span> {cupom.vendedor.name} ({cupom.vendedor.email})
                        </p>
                        {cupom.lote && (
                          <p>
                            <span className="font-semibold">Lote:</span> {cupom.lote.title}
                          </p>
                        )}
                        {cupom.description && (
                          <p className="text-gray-500 italic">{cupom.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">{cupom.totalAcessos}</p>
                        <p className="text-gray-500 text-xs">Acessos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">{cupom.totalUsos}</p>
                        <p className="text-gray-500 text-xs">Usos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-emerald-600 text-lg">{cupom.totalUsosConfirmados}</p>
                        <p className="text-gray-500 text-xs">Confirmados</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(cupom)}
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Copiar link"
                      >
                        {copiedCode === cupom.id ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => fetchDetalhe(cupom.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition text-sm font-bold"
                      >
                        {expandedCupom === cupom.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Fechar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Detalhes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleAtivo(cupom)}
                        className={`p-2 rounded-lg transition ${cupom.ativo ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={cupom.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {cupom.ativo ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(cupom)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cupom.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Deletar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCupom === cupom.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                      {loadingDetalhe ? (
                        <p className="text-center text-gray-600 py-4">⏳ Carregando detalhes...</p>
                      ) : detalhe ? (
                        <div className="space-y-6">
                          {/* Stats resumo */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                              <p className="text-lg font-black text-gray-900">{detalhe.stats.totalAcessos}</p>
                              <p className="text-xs text-gray-500">Acessos</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                              <p className="text-lg font-black text-gray-900">{detalhe.stats.totalCompras}</p>
                              <p className="text-xs text-gray-500">Compras</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                              <p className="text-lg font-black text-emerald-600">{detalhe.stats.comprasConfirmadas}</p>
                              <p className="text-xs text-gray-500">Confirmadas</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                              <p className="text-lg font-black text-gray-900">R$ {Number(detalhe.stats.totalVendas).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Total Vendas</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center bg-emerald-50">
                              <p className="text-lg font-black text-emerald-600">R$ {Number(detalhe.stats.totalComissao).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Comissão</p>
                            </div>
                          </div>

                          {/* Compras com este cupom */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5 text-emerald-600" />
                              Compras com este cupom ({detalhe.compras.length})
                            </h4>
                            {detalhe.compras.length === 0 ? (
                              <p className="text-gray-500 text-sm">Nenhuma compra com este cupom ainda</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left border-b border-gray-200">
                                      <th className="pb-2 font-bold text-gray-700">Cliente</th>
                                      <th className="pb-2 font-bold text-gray-700">Email</th>
                                      <th className="pb-2 font-bold text-gray-700">Telefone</th>
                                      <th className="pb-2 font-bold text-gray-700">Lote</th>
                                      <th className="pb-2 font-bold text-gray-700">Cotas</th>
                                      <th className="pb-2 font-bold text-gray-700">Valor</th>
                                      <th className="pb-2 font-bold text-gray-700">Desconto</th>
                                      <th className="pb-2 font-bold text-gray-700">Payment ID</th>
                                      <th className="pb-2 font-bold text-gray-700">Status</th>
                                      <th className="pb-2 font-bold text-gray-700">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalhe.compras.map((compra: any) => (
                                      <tr key={compra.id} className="border-b border-gray-100">
                                        <td className="py-2 text-gray-900 font-medium">{compra.cliente?.name || 'Anônimo'}</td>
                                        <td className="py-2 text-gray-600">{compra.cliente?.email || '-'}</td>
                                        <td className="py-2 text-gray-600">{compra.cliente?.phone || '-'}</td>
                                        <td className="py-2 text-gray-600">{compra.lote?.title || '-'}</td>
                                        <td className="py-2 text-gray-900 font-bold">{compra.livros || '-'}</td>
                                        <td className="py-2 font-bold">R$ {Number(compra.amount).toFixed(2)}</td>
                                        <td className="py-2 text-blue-600">
                                          {Number(compra.descontoAplicado) > 0
                                            ? `R$ ${Number(compra.descontoAplicado).toFixed(2)}`
                                            : '-'}
                                        </td>
                                        <td className="py-2 text-gray-500 font-mono text-xs">{compra.payment_id || '-'}</td>
                                        <td className="py-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            compra.status === 'confirmed'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : compra.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                            {compra.status === 'confirmed' ? 'Confirmado' : compra.status === 'pending' ? 'Pendente' : compra.status}
                                          </span>
                                        </td>
                                        <td className="py-2 text-gray-500">{formatDate(compra.createdAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Acessos recentes */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-600" />
                              Acessos recentes ({detalhe.acessos.length})
                            </h4>
                            {detalhe.acessos.length === 0 ? (
                              <p className="text-gray-500 text-sm">Nenhum acesso ao link ainda</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left border-b border-gray-200">
                                      <th className="pb-2 font-bold text-gray-700">IP</th>
                                      <th className="pb-2 font-bold text-gray-700">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalhe.acessos.slice(0, 20).map((acesso: any) => (
                                      <tr key={acesso.id} className="border-b border-gray-100">
                                        <td className="py-2 text-gray-600 font-mono text-xs">{acesso.ip || '-'}</td>
                                        <td className="py-2 text-gray-600">{formatDate(acesso.createdAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {detalhe.acessos.length > 20 && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Mostrando 20 de {detalhe.acessos.length} acessos
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  )
}
