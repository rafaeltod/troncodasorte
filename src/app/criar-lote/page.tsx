'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ImageUpload } from '@/components/image-upload'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currency'
import { Plus, FileText, DollarSign, Ticket, Image as ImageIcon, AlertCircle, Gift, Package, Trash2 } from 'lucide-react'

interface PremioConfig {
  tipo: 'dinheiro' | 'item'
  descricao: string
  valor: string
  porcentagemSorteio: number
}

export default function CreateRafflePageContent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    totalLivros: '',
    livroPrice: '0,50',
    images: [] as string[],
    cliente: 'troncodasorte',
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
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const payload = {
        ...formData,
        prizeAmount: formData.prizeAmount ? parseCurrencyInput(formData.prizeAmount) : 0,
        totalLivros: parseInt(formData.totalLivros),
        livroPrice: parseCurrencyInput(formData.livroPrice),
        qtdPremiosAleatorios: premios.length,
        premiosConfig: premios.length > 0 ? premios.map(p => ({
          ...p,
          valor: p.tipo === 'dinheiro' ? parseCurrencyInput(p.valor).toString() : p.valor,
          porcentagemSorteio: p.porcentagemSorteio,
        })) : undefined,
      }

      // Log do tamanho do payload
      const payloadString = JSON.stringify(payload)
      const payloadSizeKB = new Blob([payloadString]).size / 1024
      console.log(`Payload size: ${payloadSizeKB.toFixed(2)} KB`)
      console.log(`Images count: ${payload.images.length}`)
      console.log(`Description length: ${payload.description.length} chars`)

      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: payloadString,
      })

      if (!response.ok) {
        // Tratar erro 413 especificamente
        if (response.status === 413) {
          throw new Error('Requisição muito grande. Reduza o número de imagens ou o tamanho da descrição.')
        }
        
        // Tentar parsear JSON, mas pode ser HTML em caso de erro do servidor
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Erro ao criar lote (${response.status})`)
        } else {
          throw new Error(`Erro ao criar lote: ${response.status} ${response.statusText}`)
        }
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
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-azul-royal dark:bg-azul-claro">
              <Plus className="w-8 h-8 text-branco" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-cinza-escuro dark:text-cinza-claro">Criar Novo Lote</h1>
              <p className="text-cinza dark:text-gray-200">Preencha os dados para criar sua lote e ganhar!</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-branco dark:bg-[#232F3E] rounded-2xl shadow-lg p-8 space-y-8 border border-cinza-claro dark:border-gray-700">
          {error && (
            <div className="bg-vermelho-pastel dark:bg-red-900/20 border-l-4 border-vermelho-vivo dark:border-red-500 text-vermelho-vivo dark:text-red-400 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Erro</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-verde-pastel dark:bg-green-900/20 border-l-4 border-verde-menta dark:border-green-500 text-verde-menta dark:text-green-400 p-4 rounded-lg">
              <p className="font-bold">Lote criada com sucesso! Redirecionando...</p>
            </div>
          )}

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Título da Lote
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              minLength={5}
              className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 transition"
              placeholder="Ex: Lote do iPhone 15 Pro"
            />
          </div>

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Cliente (slug)
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 transition"
              placeholder="troncodasorte"
            />
            <p className="text-sm text-cinza dark:text-gray-300 mt-1">Slug do cliente a que este lote pertence. Ex: troncodasorte, tupperwaredasorte</p>
          </div>

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 resize-none"
              rows={5}
              placeholder="Descreva sua lote em detalhes... (condição, especificações, etc)"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Valor do Prêmio em Dinheiro (R$)
                <span className="text-sm font-normal text-cinza dark:text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                name="prizeAmount"
                value={formData.prizeAmount}
                onChange={handleInputChange}
                className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 transition"
                placeholder="0,00 (deixe vazio se o prêmio não for em dinheiro)"
                inputMode="numeric"
              />
              <p className="text-sm text-cinza dark:text-gray-300 mt-1">Se o prêmio não for em dinheiro, deixe em branco. Use o título e descrição para descrever o prêmio.</p>
            </div>
            <div>
              <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Total de Livros
              </label>
              <input
                type="number"
                name="totalLivros"
                value={formData.totalLivros}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 transition"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preço da Livro (R$)
            </label>
            <input
              type="text"
              name="livroPrice"
              value={formData.livroPrice}
              onChange={handleInputChange}
              className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-xl px-5 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-azul-royal dark:focus:border-azul-claro focus:ring-2 focus:ring-azul-claro dark:focus:ring-azul-claro/50 transition"
              placeholder="0,50"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Imagens da Lote (Opcional)
            </label>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={20} />
          </div>

          <div>
            <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Prêmios Aleatórios
              <span className="text-sm font-normal text-cinza dark:text-gray-400">(opcional)</span>
            </label>
            <p className="text-sm text-cinza dark:text-gray-300 mb-4">Adicione prêmios extras que serão sorteados junto com o resultado principal. Cada prêmio pode ser em dinheiro ou um item.</p>

            {premios.length > 0 && (
              <div className="space-y-3 mb-4">
                {premios.map((premio, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{index + 1}º Prêmio Aleatório</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPremios(prev => prev.filter((_, i) => i !== index))
                        }}
                        className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition"
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
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-[#1a2332] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
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
                            ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                            : 'bg-white dark:bg-[#1a2332] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Item
                      </button>
                    </div>

                    {premio.tipo === 'dinheiro' ? (
                      <div>
                        <input
                          type="text"
                          value={premio.valor}
                          onChange={(e) => {
                            const formatted = formatCurrencyInput(e.target.value)
                            setPremios(prev => prev.map((p, i) => i === index ? { ...p, valor: formatted } : p))
                          }}
                          placeholder="Valor em R$"
                          inputMode="numeric"
                          className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-cinza-claro dark:bg-[#1a2332] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-300/50 transition text-sm"
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
                          className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-cinza-claro dark:bg-[#1a2332] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-300/50 transition text-sm"
                        />
                      </div>
                    )}

                    {/* Porcentagem de ativação */}
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
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
                            className="w-14 border-2 border-purple-300 dark:border-purple-700 rounded-lg px-2 py-1 text-sm font-bold text-purple-700 dark:text-purple-300 text-center focus:outline-none focus:border-purple-500 dark:bg-[#1a2332]"
                          />
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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
              onClick={() => {
                setPremios(prev => [...prev, { tipo: 'dinheiro', descricao: '', valor: '', porcentagemSorteio: 0 }])
              }}
              className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl py-3 px-4 font-bold transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Prêmio Aleatório
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-azul-royal dark:bg-azul-claro text-branco dark:text-azul-royal py-4 rounded-xl font-extrabold text-lg hover:bg-azul-claro dark:hover:bg-amarelo-claro transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
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

          <p className="text-center text-cinza dark:text-gray-100 text-sm bg-azul-pastel dark:bg-azul-claro/20 rounded-lg p-4 flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-azul-royal dark:text-azul-claro shrink-0 mt-0.5" />
            <span><strong>Dica:</strong> Quanto mais atrativo seu prêmio e descrição, mais pessoas vão querer participar!</span>
          </p>
        </form>
      </div>
    </div>
  )
}
