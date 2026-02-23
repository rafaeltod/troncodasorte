'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { isAdult, isValidCPF, isValidEmail, isValidPhone } from '@/lib/validations'
import { formatCPF, formatPhone } from '@/lib/formatters'
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
  const { user, refetch } = useAuth()
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
      router.push('/')
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setError('Email válido é obrigatório')
      return
    }
    if (!isValidCPF(formData.cpf)) {
      setError('CPF inválido')
      return
    }
    if (!isValidPhone(formData.phone)) {
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
    if (!isAdult(formData.birthDate)) {
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

      // Atualizar context imediatamente
      await refetch()

      setSuccess('Conta criada com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 300))
      router.push('/')
    } catch (err) {
      console.error('[RegisterPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fundo-cinza flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full  mb-4 overflow-hidden">
              <Image 
                src="/troncodasorte.png"
                alt="Tronco da Sorte"
                width={60}
                height={60}
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-cinza mb-2">Criar Conta</h1>
            <p className="text-cinza">Junte-se ao Tronco da Sorte</p>
          </div>

          {/* Form Card */}
          <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-vermelho-pastel border-l-4 border-vermelho-vivo text-vermelho-vivo p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-verde-pastel border-l-4 border-verde-agua text-verde-agua p-4 rounded-lg mb-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{success}</p>
                </div>
              )}

              {/* Nome Completo */}
              <div>
                <label className="text-cinza font-bold text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-azul-royal" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João da Silva"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-fundo-cinza text-cinza"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="text-cinza font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-azul-royal" />
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-fundo-cinza text-cinza"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-cinza font-bold text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-azul-royal" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-fundo-cinza text-cinza"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="text-cinza font-bold text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-azul-royal" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-fundo-cinza text-cinza"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className=" text-cinza font-bold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-azul-royal" />
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-fundo-cinza text-cinza"
                />
              </div>

              {/* Termos e Condições */}
              <div className="bg-azul-pastel  rounded-lg p-4 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 accent-azul-royal rounded focus:ring-2 focus:ring-azul-royal cursor-pointer"
                  />
                  <div className="text-sm text-cinza">
                    <span className="font-semibold">Li e aceito o </span>
                    <Link href="/termos" className="text-azul-royal hover:text-azul-royal font-bold">
                      Termos e Condições
                    </Link>
                    {' '}e a{' '}
                    <Link href="/privacidade" className="text-azul-royal hover:text-azul-royal font-bold">
                      Política de Privacidade
                    </Link>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-azul-royal text-white py-3 cursor-pointer rounded-full font-bold text-lg hover:bg-branco hover:text-azul-royal border transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <p className="text-center text-cinza mt-4">
                Já tem conta?{' '}
                <Link href="/auth/login" className="text-azul-royal hover:text-azul-royal font-bold">
                  Faça login
                </Link>
              </p>

              <div className="text-center mt-6">
                <Link href="/" className="text-cinza hover:text-azul-royal font-semibold text-sm">
                  ← Voltar para Início
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    )
  }
