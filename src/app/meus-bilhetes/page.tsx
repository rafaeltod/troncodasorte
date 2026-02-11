'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, FileText, ArrowLeft } from 'lucide-react'
import { isValidPhone, isValidCPF } from '@/lib/validations'
import { formatPhone, formatCPF } from '@/lib/formatters'

export default function MyTicketsPage() {
  const router = useRouter()
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
      router.push(`/meus-bilhetes/resultado`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-flex transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <Phone className="w-8 h-8 text-emerald-600" />
            Meus Bilhetes
          </h1>
          <p className="text-gray-600 mb-6">
            Consulte suas compras usando telefone e CPF
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
              <p className="font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900 font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.phone || !formData.cpf}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
            >
              {loading ? '⏳ Consultando...' : 'Consultar Bilhetes'}
            </button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-900 font-semibold">
              ℹ️ Seus dados são protegidos e usados apenas para localizar suas compras.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
