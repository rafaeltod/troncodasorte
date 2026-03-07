'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminRoute } from '@/components/admin-route'
import { ImageUpload } from '@/components/image-upload'
import { formatCurrencyInput, parseCurrencyInput, formatCurrency } from '@/lib/currency'
import { ArrowLeft, Trash2, Gift, Plus, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'

interface PremioConfig {
  tipo: 'dinheiro' | 'item'
  descricao: string
  valor: string
  porcentagemSorteio: number
  number?: string
  drawnNumber?: string
  winner?: string
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
  images: string[]
}

export default function EditLotePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lote, setLote] = useState<Lote | null>(null)
  const [premios, setPremios] = useState<PremioConfig[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    totalLivros: '',
    livroPrice: '',
    status: 'open',
    images: [] as string[],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchLote = async () => {
      try {
        const response = await fetch(`/api/admin/lotes/${id}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Erro ao buscar lote')
        }

        const data = await response.json()
        setLote(data)
        setFormData({
          title: data.title,
          description: data.description,
          prizeAmount: data.prizeAmount ? formatCurrency(data.prizeAmount) : '',
          totalLivros: data.totalLivros.toString(),
          livroPrice: formatCurrency(data.livroPrice),
          status: data.status,
          // Parse images if it's a JSON string, otherwise use as is
          images: typeof data.images === 'string' ? JSON.parse(data.images) : (Array.isArray(data.images) ? data.images : []),
        })
        // Carregar premiosConfig existente
        if (data.premiosConfig) {
          const raw = typeof data.premiosConfig === 'string' ? JSON.parse(data.premiosConfig) : data.premiosConfig
          if (Array.isArray(raw)) {
            setPremios(raw.map((p: PremioConfig) => ({
              tipo: p.tipo || 'dinheiro',
              descricao: p.descricao || '',
              valor: p.valor ? formatCurrency(parseFloat(p.valor)) : '',
              porcentagemSorteio: p.porcentagemSorteio ?? 0,
              number: p.number,
              drawnNumber: p.drawnNumber,
              winner: p.winner,
            })))
          }
        }
      } catch (error) {
        console.error('Erro ao buscar lote:', error)
        setError('Erro ao carregar lote')
      } finally {
        setLoading(false)
      }
    }

    fetchLote()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Formatar campos de moeda
    if (name === 'prizeAmount' || name === 'livroPrice') {
      const formatted = formatCurrencyInput(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/lotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prizeAmount: parseCurrencyInput(formData.prizeAmount) || 0,
          totalLivros: parseInt(formData.totalLivros, 10),
          livroPrice: parseCurrencyInput(formData.livroPrice),
          status: formData.status,
          images: formData.images,
          premiosConfig: premios.map(p => ({
            ...( p.number ? { number: p.number } : {}),
            ...( p.drawnNumber ? { drawnNumber: p.drawnNumber } : {}),
            ...( p.winner ? { winner: p.winner } : {}),
            tipo: p.tipo,
            descricao: p.descricao,
            valor: p.tipo === 'dinheiro' ? parseCurrencyInput(p.valor).toString() : p.valor,
            porcentagemSorteio: p.porcentagemSorteio,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar lote')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error) {
      console.error('Erro ao atualizar lote:', error)
      setError('Erro ao atualizar lote. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
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
      router.push('/admin')
    } catch (error) {
      console.error('Erro ao deletar lote:', error)
      alert('Erro ao deletar lote')
    }
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
          <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
        </div>
      </AdminRoute>
    )
  }

  if (!lote) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-fundo-cinza flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-cinza mb-3">
              Lote não encontrada
            </h2>
            <Link
              href="/admin"
              className="text-azul-royal hover:underline font-bold"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-fundo-cinza py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-azul-royal hover:text-azul-royal font-bold mb-4"
            >
              <ArrowLeft size={20} /> Voltar ao painel
            </Link>
            <h1 className="text-5xl font-black text-cinza mb-3">
              Editar Lote
            </h1>
            <p className="text-lg text-cinza">
              Atualize as informações da sua lote
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-verde-pastel text-verde-menta px-6 py-4 rounded-xl font-bold">
              Lote atualizada com sucesso! Redirecionando...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-vermelho-pastel text-vermelho-vivo px-6 py-4 rounded-xl font-bold">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-branco rounded-2xl shadow-lg p-8 border-2 border-cinza-claro">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="title">
                Título da Lote
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-cinza border-2 border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border-2 text-cinza border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium resize-none"
                required
              />
            </div>

            {/* Prize Amount */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="prizeAmount">
                Valor do Prêmio em Dinheiro (R$) <span className="text-sm font-normal text-fundo-cinza0">(opcional)</span>
              </label>
              <input
                type="text"
                id="prizeAmount"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 text-cinza border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                placeholder="0,00 (deixe vazio se não for em dinheiro)"
                inputMode="numeric"
              />
              <p className="text-sm text-fundo-cinza0 mt-1">Se o prêmio não for em dinheiro, deixe em branco ou zero.</p>
            </div>

            {/* Total Livros */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="totalLivros">
                Total de Livros
              </label>
              <input
                type="number"
                id="totalLivros"
                name="totalLivros"
                value={formData.totalLivros}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 text-cinza border-2 border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                required
                disabled={lote.soldLivros > 0}
              />
              {lote.soldLivros > 0 && (
                <p className="text-sm text-cinza mt-2">
                  Não é possível alterar o total de livros após vendas realizadas ({lote.soldLivros} vendidos)
                </p>
              )}
            </div>

            {/* Livro Price */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="livroPrice">
                Preço por Livro (R$)
              </label>
              <input
                type="text"
                id="livroPrice"
                name="livroPrice"
                value={formData.livroPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-cinza border-2 border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                required
                disabled={lote.soldLivros > 0}
                inputMode="numeric"
              />
              {lote.soldLivros > 0 && (
                <p className="text-sm text-cinza mt-2">
                  Não é possível alterar o preço após vendas realizadas
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-cinza font-bold mb-2" htmlFor="status">
                Status da Lote
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 text-cinza hover:cursor-pointer py-3 border-2 border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                required
              >
                <option className='text-cinza hover:cursor-pointer' value="open">Aberta</option>
                <option className='text-cinza hover:cursor-pointer' value="closed">Fechada</option>
                <option className='text-cinza hover:cursor-pointer' value="finished">Finalizada</option>
              </select>
            </div>

            {/* Images */}
            <div className="mb-8">
              <label className="block text-cinza font-bold mb-2">
                Imagens da Lote
              </label>
              <ImageUpload
                initialImages={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
            </div>

            {/* Prêmios Aleatórios */}
            <div className="mb-8">
              <label className="block text-cinza font-bold mb-1 flex items-center gap-2">
                <Gift size={18} />
                Prêmios Aleatórios
              </label>
              <p className="text-sm text-cinza mb-4">
                Configure os prêmios extras. A <strong>porcentagem de ativação</strong> define a partir de qual percentual de livros vendidos o prêmio entra em vigor (0% = desde o início, 100% = somente ao fechar o lote).
              </p>

              {premios.length > 0 && (
                <div className="space-y-3 mb-4">
                  {premios.map((premio, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-purple-700">{index + 1}º Prêmio Aleatório{premio.number ? ` — #${premio.number}` : ''}</span>
                        <button
                          type="button"
                          onClick={() => setPremios(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tipo */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setPremios(prev => prev.map((p, i) => i === index ? { ...p, tipo: 'dinheiro', descricao: '' } : p))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${premio.tipo === 'dinheiro' ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          <DollarSign className="w-4 h-4" /> Dinheiro
                        </button>
                        <button
                          type="button"
                          onClick={() => setPremios(prev => prev.map((p, i) => i === index ? { ...p, tipo: 'item', valor: '' } : p))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${premio.tipo === 'item' ? 'bg-purple-100 border-purple-400 text-purple-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          <Package className="w-4 h-4" /> Item
                        </button>
                      </div>

                      {/* Valor / Descrição */}
                      {premio.tipo === 'dinheiro' ? (
                        <input
                          type="text"
                          value={premio.valor}
                          onChange={(e) => {
                            const formatted = formatCurrencyInput(e.target.value)
                            setPremios(prev => prev.map((p, i) => i === index ? { ...p, valor: formatted } : p))
                          }}
                          placeholder="Valor em R$"
                          inputMode="numeric"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-cinza focus:outline-none focus:border-emerald-500 transition text-sm mb-3"
                        />
                      ) : (
                        <input
                          type="text"
                          value={premio.descricao}
                          onChange={(e) => setPremios(prev => prev.map((p, i) => i === index ? { ...p, descricao: e.target.value } : p))}
                          placeholder="Ex: Fone Bluetooth, Camiseta, etc"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-cinza focus:outline-none focus:border-purple-500 transition text-sm mb-3"
                        />
                      )}

                      {/* Porcentagem de ativação */}
                      <div>
                        <label className="block text-xs font-bold text-cinza mb-1">
                          Porcentagem de ativação:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={premio.porcentagemSorteio}
                            onChange={(e) => setPremios(prev => prev.map((p, i) => i === index ? { ...p, porcentagemSorteio: Number(e.target.value) } : p))}
                            className="flex-1 accent-purple-600"
                          />
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={premio.porcentagemSorteio}
                              onChange={(e) => {
                                const v = Math.min(100, Math.max(0, Number(e.target.value)))
                                setPremios(prev => prev.map((p, i) => i === index ? { ...p, porcentagemSorteio: v } : p))
                              }}
                              className="w-14 border-2 border-purple-300 rounded-lg px-2 py-1 text-sm font-bold text-purple-700 text-center focus:outline-none focus:border-purple-500"
                            />
                            <span className="text-sm font-bold text-purple-700">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-cinza mt-1">
                          <span>0% (desde o início)</span>
                          <span>100% (lote cheio)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPremios(prev => [...prev, { tipo: 'dinheiro', descricao: '', valor: '', porcentagemSorteio: 0 }])}
                className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl py-3 px-4 font-bold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Prêmio Aleatório
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-azul-royal text-branco px-6 py-4 rounded-full font-bold hover:bg-branco border hover:text-azul-royal transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? ' Salvando...' : 'Salvar Alterações'}
              </button>

              <button
                type="button"
                className="px-6 py-4 bg-vermelho-vivo text-branco rounded-full font-bold hover:bg-vermelho-claro transition shadow-lg"
              > Deletar Lote
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminRoute>
  )
}
