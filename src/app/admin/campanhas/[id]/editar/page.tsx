'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminRoute } from '@/components/admin-route'
import { ImageUpload } from '@/components/image-upload'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Campanha {
  id: string
  title: string
  description: string
  prizeAmount: number
  quotaPrice: number
  totalQuotas: number
  soldQuotas: number
  status: string
  images: string[]
}

export default function EditCampanhaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    totalQuotas: '',
    quotaPrice: '',
    status: 'open',
    images: [] as string[],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchCampanha = async () => {
      try {
        const response = await fetch(`/api/admin/campanhas/${id}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Erro ao buscar campanha')
        }

        const data = await response.json()
        setCampanha(data)
        setFormData({
          title: data.title,
          description: data.description,
          prizeAmount: data.prizeAmount.toString(),
          totalQuotas: data.totalQuotas.toString(),
          quotaPrice: data.quotaPrice.toString(),
          status: data.status,
          // Parse images if it's a JSON string, otherwise use as is
          images: typeof data.images === 'string' ? JSON.parse(data.images) : (Array.isArray(data.images) ? data.images : []),
        })
      } catch (error) {
        console.error('Erro ao buscar campanha:', error)
        setError('Erro ao carregar campanha')
      } finally {
        setLoading(false)
      }
    }

    fetchCampanha()
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
      const response = await fetch(`/api/admin/campanhas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prizeAmount: parseFloat(formData.prizeAmount),
          totalQuotas: parseInt(formData.totalQuotas, 10),
          quotaPrice: parseFloat(formData.quotaPrice),
          status: formData.status,
          images: formData.images,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar campanha')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error)
      setError('Erro ao atualizar campanha. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
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
      router.push('/admin')
    } catch (error) {
      console.error('Erro ao deletar campanha:', error)
      alert('Erro ao deletar campanha')
    }
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl font-bold text-gray-600">Carregando...</div>
        </div>
      </AdminRoute>
    )
  }

  if (!campanha) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Campanha não encontrada
            </h2>
            <Link
              href="/admin"
              className="text-emerald-600 hover:underline font-bold"
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-4"
            >
              <ArrowLeft size={20} /> Voltar ao painel
            </Link>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Editar Campanha
            </h1>
            <p className="text-lg text-gray-600">
              Atualize as informações da sua campanha
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-100 border-2 border-green-600 text-green-800 px-6 py-4 rounded-xl font-bold">
              Campanha atualizada com sucesso! Redirecionando...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border-2 border-red-600 text-red-800 px-6 py-4 rounded-xl font-bold">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="title">
                Título da Campanha
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-gray-400 border-2 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border-2 text-gray-400 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium resize-none"
                required
              />
            </div>

            {/* Prize Amount */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="prizeAmount">
                Valor do Prêmio (R$)
              </label>
              <input
                type="number"
                id="prizeAmount"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border-2 text-gray-400 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                required
              />
            </div>

            {/* Total Quotas */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="totalQuotas">
                Total de Cotas
              </label>
              <input
                type="number"
                id="totalQuotas"
                name="totalQuotas"
                value={formData.totalQuotas}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 text-gray-400 border-2 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                required
                disabled={campanha.soldQuotas > 0}
              />
              {campanha.soldQuotas > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Não é possível alterar o total de cotas após vendas realizadas ({campanha.soldQuotas} vendidas)
                </p>
              )}
            </div>

            {/* Quota Price */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="quotaPrice">
                Preço por Cota (R$)
              </label>
              <input
                type="number"
                id="quotaPrice"
                name="quotaPrice"
                value={formData.quotaPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full text-gray-400 px-4 py-3 border-2 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                required
                disabled={campanha.soldQuotas > 0}
              />
              {campanha.soldQuotas > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Não é possível alterar o preço após vendas realizadas
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-gray-900 font-bold mb-2" htmlFor="status">
                Status da Campanha
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 text-gray-400 hover:cursor-pointer py-3 border-2 border-gray-500 rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                required
              >
                <option className='text-gray-400 hover:cursor-pointer' value="open">Aberta</option>
                <option className='text-gray-400 hover:cursor-pointer' value="closed">Fechada</option>
                <option className='text-gray-400 hover:cursor-pointer' value="finished">Finalizada</option>
              </select>
            </div>

            {/* Images */}
            <div className="mb-8">
              <label className="block text-gray-900 font-bold mb-2">
                Imagens da Campanha
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
                className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? ' Salvando...' : <><Save className="inline mr-2" size={20} /> Salvar Alterações</>}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
              >
                <Trash2 className="inline mr-2" size={20} /> Deletar Campanha
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminRoute>
  )
}
