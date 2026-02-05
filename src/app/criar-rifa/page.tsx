'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ImageUpload } from '@/components/image-upload'

export default function CreateRafflePageContent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    totalQuotas: '',
    quotaPrice: '0.50',
    images: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/rifas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          prizeAmount: parseFloat(formData.prizeAmount),
          totalQuotas: parseInt(formData.totalQuotas),
          quotaPrice: parseFloat(formData.quotaPrice),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao criar rifa (${response.status})`)
      }

      const data = await response.json()
      setSuccess(true)
      setIsSubmitting(false)
      
      setTimeout(() => {
        router.push(`/rifas/${data.id}`)
      }, 1500)
    } catch (err) {
      console.error('Error creating raffle:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar rifa')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-900 mb-3">🚀 Criar Nova Rifa</h1>
          <p className="text-lg text-slate-600">Preencha os dados para criar sua rifa e começar a ganhar!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-slate-100">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
              <p className="font-bold">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-600 text-green-700 p-4 rounded-lg">
              <p className="font-bold">✅ Rifa criada com sucesso! Redirecionando...</p>
            </div>
          )}

          <div>
            <label className="block text-slate-900 font-bold text-lg mb-3">📝 Título da Rifa</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              minLength={5}
              className="w-full border-2 border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
              placeholder="Ex: Rifa do iPhone 15 Pro"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-lg mb-3">📄 Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border-2 border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 resize-none"
              rows={5}
              placeholder="Descreva sua rifa em detalhes... (condição, especificações, etc)"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-900 font-bold text-lg mb-3">💰 Valor do Prêmio (R$)</label>
              <input
                type="number"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full border-2 border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                placeholder="5000.00"
              />
            </div>
            <div>
              <label className="block text-slate-900 font-bold text-lg mb-3">🎫 Total de Cotas</label>
              <input
                type="number"
                name="totalQuotas"
                value={formData.totalQuotas}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full border-2 border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-lg mb-3">💵 Preço da Cota (R$)</label>
            <input
              type="number"
              name="quotaPrice"
              value={formData.quotaPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              className="w-full border-2 border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
              placeholder="0.50"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-lg mb-3">🖼️ Imagens da Rifa (Opcional)</label>
            <p className="text-slate-600 text-sm mb-3">
              ⚠️ Imagens de base64 podem causar problemas. Use ImageKit.io ou URLs diretas para melhor performance.
            </p>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={5} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-black text-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? '⏳ Criando sua rifa...' : '✨ Criar Rifa Agora'}
          </button>

          <p className="text-center text-slate-600 text-sm">
            💡 Dica: Quanto mais atrativo seu prêmio e descrição, mais pessoas vão querer participar!
          </p>
        </form>
      </div>
    </div>
  )
}
