'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ImageUpload } from '@/components/image-upload'
import { Plus, FileText, DollarSign, Ticket, Image as ImageIcon, AlertCircle } from 'lucide-react'

export default function CreateRafflePageContent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    totalLivros: '',
    livroPrice: '0.50',
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
      <div className="min-h-screen bg-fundo-cinza flex items-center justify-center">
        <div className="text-xl font-bold text-cinza">Carregando...</div>
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
      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          prizeAmount: formData.prizeAmount ? parseFloat(formData.prizeAmount) : 0,
          totalLivros: parseInt(formData.totalLivros),
          livroPrice: parseFloat(formData.livroPrice),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao criar lote (${response.status})`)
      }

      const data = await response.json()
      setSuccess(true)
      setIsSubmitting(false)
      
      setTimeout(() => {
        router.push(`/lotes/${data.id}`)
      }, 1500)
    } catch (err) {
      console.error('Error creating raffle:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar lote')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-fundo-cinza py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-azul-royal">
              <Plus className="w-8 h-8 text-branco" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-cinza-escuro">Criar Novo Lote</h1>
              <p className="text-cinza">Preencha os dados para criar sua lote e ganhar!</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-branco rounded-2xl shadow-lg p-8 space-y-8 border border-cinza-claro">
          {error && (
            <div className="bg-vermelho border-l-4 border-vermelho-vivo text-vermelho-vivo p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Erro</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-verde-pastel text-verde-menta p-4 rounded-lg">
              <p className="font-bold">Lote criada com sucesso! Redirecionando...</p>
            </div>
          )}

          <div>
            <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-azul-royal" />
              Título da Lote
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              minLength={5}
              className="w-full border-2 border-cinza-claro rounded-xl px-5 py-3 text-cinza-escuro placeholder-cinza focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro transition"
              placeholder="Ex: Lote do iPhone 15 Pro"
            />
          </div>

          <div>
            <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-azul-royal" />
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border-2 border-cinza-claro rounded-xl px-5 py-3 text-cinza-escuro placeholder-cinza focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro resize-none"
              rows={5}
              placeholder="Descreva sua lote em detalhes... (condição, especificações, etc)"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-azul-royal" />
                Valor do Prêmio em Dinheiro (R$)
                <span className="text-sm font-normal text-fundo-cinza0">(opcional)</span>
              </label>
              <input
                type="number"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full border-2 border-cinza-claro rounded-xl px-5 py-3 text-cinza-escuro placeholder-cinza focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro transition"
                placeholder="0.00 (deixe vazio se o prêmio não for em dinheiro)"
              />
              <p className="text-sm text-fundo-cinza0 mt-1">Se o prêmio não for em dinheiro, deixe em branco. Use o título e descrição para descrever o prêmio.</p>
            </div>
            <div>
              <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-azul-royal" />
                Total de Livros
              </label>
              <input
                type="number"
                name="totalLivros"
                value={formData.totalLivros}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full border-2 border-cinza-claro rounded-xl px-5 py-3 text-cinza-escuro placeholder-cinza focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro transition"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-azul-royal" />
              Preço da Livro (R$)
            </label>
            <input
              type="number"
              name="livroPrice"
              value={formData.livroPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              className="w-full border-2 border-cinza-claro rounded-xl px-5 py-3 text-cinza-escuro placeholder-cinza focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-claro transition"
              placeholder="0.50"
            />
          </div>

          <div>
            <label className=" text-cinza-escuro font-bold text-lg mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-azul-royal" />
              Imagens da Lote (Opcional)
            </label>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={5} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-azul-royal text-branco py-4 rounded-xl font-extrabold text-lg hover:bg-azul-claro transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                Criando sua lote...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Criar Lote Agora
              </>
            )}
          </button>

          <p className="text-center text-cinza text-sm bg-azul-pastel rounded-lg p-4 flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-azul-royal shrink-0 mt-0.5" />
            <span><strong>Dica:</strong> Quanto mais atrativo seu prêmio e descrição, mais pessoas vão querer participar!</span>
          </p>
        </form>
      </div>
    </div>
  )
}
