'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { VendedorRoute } from '@/components/vendedor-route'
import { useAuth } from '@/context/auth-context'
import { formatCurrency } from '@/lib/formatters'
import Link from 'next/link'
import { Tag, Eye, Users, DollarSign, TrendingUp, Copy, Check, ExternalLink, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'

interface CupomData {
  id: string
  code: string
  discount: number
  tipoDesconto: string
  comissao: number
  description: string | null
  ativo: boolean
  lote: { id: string; title: string } | null
  totalAcessos: number
  totalUsos: number
  totalUsosConfirmados: number
  totalVendas: number
  totalComissao: number
}

interface Resumo {
  totalCupons: number
  totalAcessos: number
  totalUsos: number
  totalUsosConfirmados: number
  totalVendas: number
  totalComissao: number
}

interface CupomDetalheData {
  cupom: any
  acessos: any[]
  compras: any[]
  stats: {
    totalAcessos: number
    totalCompras: number
    comprasConfirmadas: number
    totalVendas: number
    totalComissao: number
  }
}

export default function VendedorPage() {
  const { user, loading: authLoading } = useAuth()
  const [cupons, setCupons] = useState<CupomData[]>([])
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedCupom, setExpandedCupom] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<CupomDetalheData | null>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [authLoading, user])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/vendedor/dashboard', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCupons(data.cupons || [])
        setResumo(data.resumo || null)
      }
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error)
    } finally {
      setLoading(false)
    }
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
      const res = await fetch(`/api/vendedor/cupons/${cupomId}`, { credentials: 'include' })
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

  const copyLink = (cupom: CupomData) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const path = cupom.lote ? `/lotes/${cupom.lote.id}` : ''
    const link = `${baseUrl}${path}?cupom=${cupom.code}`
    navigator.clipboard.writeText(link)
    setCopiedCode(cupom.id)
    setTimeout(() => setCopiedCode(null), 2000)
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

  const params = useParams()
  const cliente = typeof params?.cliente === 'string' ? params.cliente : ''

  return (
    <VendedorRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-cinza-escuro">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Link href={`/${cliente}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-black text-gray-900 dark:text-cinza-claro flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                Painel do Vendedor
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-9">
              Bem-vindo, <span className="font-bold">{user?.name}</span>! Acompanhe seus cupons e comissões.
            </p>
          </div>

          {/* Stats Cards */}
          {resumo && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white dark:bg-[#232F3E] rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-semibold">Cupons</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-cinza-claro">{resumo.totalCupons}</p>
              </div>
              <div className="bg-white dark:bg-[#232F3E] rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-semibold">Acessos</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-cinza-claro">{resumo.totalAcessos}</p>
              </div>
              <div className="bg-white dark:bg-[#232F3E] rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-semibold">Usos</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-cinza-claro">{resumo.totalUsos}</p>
              </div>
              <div className="bg-white dark:bg-[#232F3E] rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold">Confirmados</span>
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resumo.totalUsosConfirmados}</p>
              </div>
              <div className="bg-white dark:bg-[#232F3E] rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold">Vendas</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-cinza-claro">
                  R$ {resumo.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl shadow p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold opacity-90">Comissão</span>
                </div>
                <p className="text-2xl font-black">
                  R$ {resumo.totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Cupons List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-cinza-claro text-lg">⏳ Carregando seus dados...</p>
            </div>
          ) : cupons.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#232F3E] rounded-2xl shadow border border-gray-200 dark:border-gray-700">
              <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-cinza-claro text-lg font-bold">Nenhum cupom atribuído</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Seus cupons aparecerão aqui quando forem criados pelo administrador</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-cinza-claro mb-4">Meus Cupons</h2>
              {cupons.map(cupom => (
                <div key={cupom.id} className={`bg-white dark:bg-[#232F3E] rounded-xl shadow border ${cupom.ativo ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-900 opacity-60'}`}>
                  {/* Cupom Header */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-mono font-black text-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                            {cupom.code}
                          </span>
                          {!cupom.ativo && (
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">INATIVO</span>
                          )}
                          {cupom.discount > 0 && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                              {cupom.tipoDesconto === 'percentual' ? `${cupom.discount}%` : `R$ ${cupom.discount}`} OFF
                            </span>
                          )}
                          {cupom.comissao > 0 && (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                              {cupom.comissao}% comissão
                            </span>
                          )}
                        </div>
                        {cupom.lote && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Lote:</span> {cupom.lote.title}
                          </p>
                        )}
                        {cupom.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">{cupom.description}</p>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-black text-gray-900 dark:text-cinza-claro text-lg">{cupom.totalAcessos}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Acessos</p>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-gray-900 dark:text-cinza-claro text-lg">{cupom.totalUsosConfirmados}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Vendas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                            R$ {Number(cupom.totalComissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Comissão</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(cupom)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition text-sm font-bold"
                          title="Copiar link de divulgação"
                        >
                          {copiedCode === cupom.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar Link
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => fetchDetalhe(cupom.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-sm font-bold"
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
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCupom === cupom.id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-[#1a2332]">
                      {loadingDetalhe ? (
                        <p className="text-center text-gray-600 dark:text-cinza-claro py-4">⏳ Carregando detalhes...</p>
                      ) : detalhe ? (
                        <div className="space-y-6">
                          {/* Compras com este cupom */}
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-cinza-claro mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              Compras com este cupom ({detalhe.compras.length})
                            </h4>
                            {detalhe.compras.length === 0 ? (
                              <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma compra com este cupom ainda</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Cliente</th>
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Lote</th>
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Valor</th>
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Desconto</th>
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Status</th>
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalhe.compras.map((compra: any) => (
                                      <tr key={compra.id} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-2 text-gray-900 dark:text-cinza-claro">{compra.cliente?.name || 'Anônimo'}</td>
                                        <td className="py-2 text-gray-600 dark:text-gray-400">{compra.lote?.title || '-'}</td>
                                        <td className="py-2 font-bold">R$ {Number(compra.amount).toFixed(2)}</td>
                                        <td className="py-2 text-blue-600 dark:text-blue-400">
                                          {Number(compra.descontoAplicado) > 0
                                            ? `R$ ${Number(compra.descontoAplicado).toFixed(2)}`
                                            : '-'}
                                        </td>
                                        <td className="py-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            compra.status === 'confirmed'
                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                              : compra.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                          }`}>
                                            {compra.status === 'confirmed' ? 'Confirmado' : compra.status === 'pending' ? 'Pendente' : compra.status}
                                          </span>
                                        </td>
                                        <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(compra.createdAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Acessos recentes */}
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-cinza-claro mb-3 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              Acessos recentes ({detalhe.acessos.length})
                            </h4>
                            {detalhe.acessos.length === 0 ? (
                              <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum acesso ao link ainda</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                      <th className="pb-2 font-bold text-gray-700 dark:text-gray-300">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalhe.acessos.slice(0, 20).map((acesso: any) => (
                                      <tr key={acesso.id} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-2 text-gray-600 dark:text-gray-400">{formatDate(acesso.createdAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {detalhe.acessos.length > 20 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
    </VendedorRoute>
  )
}
