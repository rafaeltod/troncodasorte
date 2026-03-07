'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Phone, FileText, ArrowLeft } from 'lucide-react'
import { isValidPhone, isValidCPF } from '@/lib/validations'
import { formatPhone, formatCPF } from '@/lib/formatters'

export default function MyTicketsPage() {
  const router = useRouter()
  const params = useParams()
  const cliente = typeof params?.cliente === 'string' ? params.cliente : ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    phone: '',
    cpf: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'cpf'
          ? formatCPF(value)
          : name === 'phone'
          ? formatPhone(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidPhone(formData.phone)) {
      setError('Telefone inválido')
      return
    }

    if (!isValidCPF(formData.cpf)) {
      setError('CPF inválido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/check-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, ''),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao buscar compras')
      }

      const data = await response.json()
      // Salvar dados temporários na session/localStorage para exibir perfil
      localStorage.setItem('ticketQuery', JSON.stringify({
        phone: formData.phone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
      }))
      router.push(`/${cliente}/meus-bilhetes/resultado`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <a href={`/${cliente}`} className=" items-center gap-2 text-azul-royal dark:text-amarelo-claro text-1xl font-bold inline-flex transition">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </a>
        </div>

        <div className="bg-white dark:bg-[#232F3E] rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-black text-cinza-escuro dark:text-amarelo-claro mb-2 flex items-center gap-2">
            Meus Bilhetes
          </h1>
          <p className="text-cinza mb-6 dark:text-gray-400">
            Consulte suas compras usando telefone e CPF
          </p>

          {error && (
            <div className="mb-6 bg-fundo-cinza dark:bg-red-900/20 border-l-4 border-vermelho-vivo dark:border-red-500 text-vermelho-vivo dark:text-red-400 p-4 rounded-lg">
              <p className="font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-cinza-escuro dark:text-amarelo-claro mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-white dark:bg-[#1a2332] text-cinza-escuro dark:text-cinza-claro font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-cinza-escuro dark:text-amarelo-claro mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-white dark:bg-[#1a2332] text-cinza-escuro dark:text-cinza-claro font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.phone || !formData.cpf}
              className="w-full bg-azul-royal dark:bg-azul-claro/70 text-branco py-4 cursor-pointer rounded-full font-black text-lg hover:bg-azul-royal/80 hover:text-azul-royal dark:hover:text-branco dark:hover:bg-azul-claro/30 transition disabled:hover:bg-azul-royal disabled:hover:text-branco disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
            >
              {loading ? "Consultando..." : "Consultar Bilhetes"}
            </button>
          </form>

          <div className="bg-azul-pastel dark:bg-azul-claro/20 rounded-lg p-4 mt-6">
            <p className="text-sm text-azul-royal dark:text-azul-claro font-semibold">
              Seus dados são protegidos e usados apenas para localizar suas
              compras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
