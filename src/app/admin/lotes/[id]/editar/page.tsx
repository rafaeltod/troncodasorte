'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminRoute } from '@/components/admin-route'
import { ImageUpload } from '@/components/image-upload'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

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
          prizeAmount: data.prizeAmount ? data.prizeAmount.toString() : '',
          totalLivros: data.totalLivros.toString(),
          livroPrice: data.livroPrice.toString(),
          status: data.status,
          // Parse images if it's a JSON string, otherwise use as is
          images: typeof data.images === 'string' ? JSON.parse(data.images) : (Array.isArray(data.images) ? data.images : []),
        })
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
          prizeAmount: parseFloat(formData.prizeAmount) || 0,
          totalLivros: parseInt(formData.totalLivros, 10),
          livroPrice: parseFloat(formData.livroPrice),
          status: formData.status,
          images: formData.images,
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
        <div className="min-h-screen bg-fundo-cinza flex items-center justify-center">
          <div className="text-xl font-bold text-cinza">Carregando...</div>
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
                type="number"
                id="prizeAmount"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border-2 text-cinza border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                placeholder="0.00 (deixe vazio se não for em dinheiro)"
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
                type="number"
                id="livroPrice"
                name="livroPrice"
                value={formData.livroPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 text-cinza border-2 border-fundo-cinza rounded-xl focus:border-azul-royal focus:outline-none font-medium"
                required
                disabled={lote.soldLivros > 0}
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
