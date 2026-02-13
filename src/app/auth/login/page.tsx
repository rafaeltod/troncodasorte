'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { LogIn, FileText, Phone, CheckCircle2, AlertCircle } from 'lucide-react'

interface FormData {
  cpf: string
  phone: string
}

export default function LoginPage() {
  const router = useRouter()
  const { user, refetch } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    cpf: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/campanhas')
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validar CPF
    if (!formData.cpf.replace(/\D/g, '') || formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF é obrigatório e deve ser válido')
      return
    }

    // Validar telefone
    const hasPhone = formData.phone.replace(/\D/g, '').length >= 10

    if (!hasPhone) {
      setError('Informe um telefone válido')
      return
    }

    setLoading(true)

    try {
      const loginPayload = {
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginPayload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Atualizar context imediatamente
      await refetch()

      setSuccess('✅ Login realizado com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 300))
      router.push('/campanhas')
    } catch (err) {
      console.error('[LoginPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-emerald-600 to-teal-600 mb-4 overflow-hidden">
              <Image 
                src="/troncodasorte.png"
                alt="Tronco da Sorte"
                width={60}
                height={60}
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Entrar</h1>
            <p className="text-gray-600">Acesse sua conta no Tronco da Sorte</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{success}</p>
                </div>
              )}

              {/* CPF Input */}
              <div>
                <label className=" text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                  autoFocus
                />
              </div>

<<<<<<< HEAD
              {/* Email Input */}
              <div>
                <label className="text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                />
              </div>

              <div className="text-center text-sm text-gray-600">ou</div>

=======
>>>>>>> 526881503b11afbb6d7cbb604796536d09168974
              {/* Phone Input */}
              <div>
                <label className="text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                />
              </div>

              <p className="text-xs text-gray-600 text-center">* Campos obrigatórios</p>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
              >
                {loading ? '⏳ Entrando...' : '🎯 Entrar'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600 font-semibold">Não tem conta?</span>
                </div>
              </div>

              <Link href="/auth/register" className="w-full block">
                <button
                  type="button"
                  className="w-full bg-white border-2 border-emerald-600 text-emerald-600 py-3 rounded-lg font-bold text-lg hover:bg-emerald-50 transition"
                >
                  ✨ Criar Conta
                </button>
              </Link>

              <div className="text-center mt-6">
                <Link href="/" className="text-gray-600 hover:text-emerald-600 font-semibold text-sm">
                  ← Voltar para Início
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    )
  }
