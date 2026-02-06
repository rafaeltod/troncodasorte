'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { UserPlus, User, Mail, FileText, Phone, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

interface FormData {
  name: string
  email: string
  cpf: string
  phone: string
  birthDate: string
  acceptedTerms: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    acceptedTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/rifas')
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14)
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validações básicas
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório')
      return
    }
    if (!formData.cpf.replace(/\D/g, '') || formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido')
      return
    }
    if (!formData.phone.replace(/\D/g, '') || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Telefone inválido')
      return
    }
    if (!formData.birthDate) {
      setError('Data de nascimento é obrigatória')
      return
    }
    if (!formData.acceptedTerms) {
      setError('Você precisa aceitar os Termos e Condições')
      return
    }

    // Validar idade mínima de 18 anos
    const birthDate = new Date(formData.birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < 18) {
        setError('Você deve ter no mínimo 18 anos de idade')
        return
      }
    } else if (age < 18) {
      setError('Você deve ter no mínimo 18 anos de idade')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
          birthDate: formData.birthDate,
          acceptedTerms: formData.acceptedTerms,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar conta')
      }

      setSuccess('✅ Conta criada com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/rifas')
    } catch (err) {
      console.error('[RegisterPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 mb-4 overflow-hidden">
              <Image 
                src="/troncodasorte.png"
                alt="Tronco da Sorte"
                width={60}
                height={60}
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Criar Conta</h1>
            <p className="text-gray-600">Junte-se ao Tronco da Sorte</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="font-bold">{success}</p>
                </div>
              )}

              {/* Nome Completo */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João da Silva"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
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

              {/* Telefone */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
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

              {/* Data de Nascimento */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-gray-50 text-gray-900"
                />
              </div>

              {/* Termos e Condições */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 text-emerald-600 rounded focus:ring-emerald-600 cursor-pointer"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Li e aceito o </span>
                    <Link href="/termos" className="text-emerald-600 hover:text-emerald-700 font-bold">
                      Termos e Condições
                    </Link>
                    {' '}e a{' '}
                    <Link href="/privacidade" className="text-emerald-600 hover:text-emerald-700 font-bold">
                      Política de Privacidade
                    </Link>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
              >
                {loading ? '⏳ Criando conta...' : '✨ Criar Conta'}
              </button>

              <p className="text-center text-gray-600 mt-4">
                Já tem conta?{' '}
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
                  Faça login
                </Link>
              </p>

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
