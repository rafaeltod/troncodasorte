'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ImageUpload } from '@/components/image-upload'
import { Plus, FileText, DollarSign, Ticket, Image as ImageIcon, AlertCircle, Gift, Package, Trash2 } from 'lucide-react'

interface PremioConfig {
  tipo: 'dinheiro' | 'item'
  descricao: string
  valor: string
}

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
  const [premios, setPremios] = useState<PremioConfig[]>([])
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
          qtdPremiosAleatorios: premios.length,
          premiosConfig: premios.length > 0 ? premios : undefined,
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

          <div>
            <label className=" text-gray-900 font-bold text-lg mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600" />
              Prêmios Aleatórios
              <span className="text-sm font-normal text-gray-500">(opcional)</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">Adicione prêmios extras que serão sorteados junto com o resultado principal. Cada prêmio pode ser em dinheiro ou um item.</p>

            {premios.length > 0 && (
              <div className="space-y-3 mb-4">
                {premios.map((premio, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-purple-700">{index + 1}º Prêmio Aleatório</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPremios(prev => prev.filter((_, i) => i !== index))
                        }}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPremios(prev => prev.map((p, i) => i === index ? { ...p, tipo: 'dinheiro', descricao: '' } : p))
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${
                          premio.tipo === 'dinheiro'
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        Dinheiro
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPremios(prev => prev.map((p, i) => i === index ? { ...p, tipo: 'item', valor: '' } : p))
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${
                          premio.tipo === 'item'
                            ? 'bg-purple-100 border-purple-400 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Item
                      </button>
                    </div>

                    {premio.tipo === 'dinheiro' ? (
                      <div>
                        <input
                          type="number"
                          value={premio.valor}
                          onChange={(e) => {
                            setPremios(prev => prev.map((p, i) => i === index ? { ...p, valor: e.target.value } : p))
                          }}
                          step="0.01"
                          min="0.01"
                          placeholder="Valor em R$"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={premio.descricao}
                          onChange={(e) => {
                            setPremios(prev => prev.map((p, i) => i === index ? { ...p, descricao: e.target.value } : p))
                          }}
                          placeholder="Ex: Fone Bluetooth, Camiseta, etc"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setPremios(prev => [...prev, { tipo: 'dinheiro', descricao: '', valor: '' }])
              }}
              className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl py-3 px-4 font-bold transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Prêmio Aleatório
            </button>
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
