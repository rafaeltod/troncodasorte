'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { isAdult, isValidCPF, isValidEmail, isValidPhone } from '@/lib/validations'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { UserPlus, User, Mail, FileText, Phone, Calendar, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react'

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
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detectar preferência de tema do sistema
  useEffect(() => {
    // Verificar se há preferência salva
    const savedTheme = localStorage.getItem('theme')
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = (isDark: boolean) => {
      setIsDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Aplicar tema inicial (preferência salva > preferência do sistema)
    if (savedTheme) {
      applyTheme(savedTheme === 'dark')
    } else {
      applyTheme(darkModeMediaQuery.matches)
    }

    // Ouvir mudanças na preferência do sistema (apenas se não houver preferência salva)
    const listener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches)
      }
    }
    darkModeMediaQuery.addEventListener('change', listener)

    return () => darkModeMediaQuery.removeEventListener('change', listener)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

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

      // NÃO atualizar context (não logar automaticamente)
      // await refetch()

      setSuccess('Conta criada com sucesso! Redirecionando para o login...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/auth/login')
    } catch (err) {
      console.error('[RegisterPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed cursor-pointer top-6 right-6 p-3 rounded-full bg-branco dark:bg-[#232F3E] border-2 border-cinza-claro dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        aria-label="Alternar tema"
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-amarelo-gold" />
        ) : (
          <Moon className="w-6 h-6 text-azul-royal" />
        )}
      </button>
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
            <h1 className="text-3xl font-black text-cinza dark:text-cinza-claro mb-2">Criar Conta</h1>
            <p className="text-cinza dark:text-gray-400">Junte-se ao Tronco da Sorte</p>
          </div>

          {/* Form Card */}
          <div className="bg-branco dark:bg-[#232F3E] rounded-2xl shadow-lg p-8 border border-cinza-claro dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-vermelho-pastel dark:bg-red-900/20 border-l-4 border-vermelho-vivo dark:border-red-500 text-vermelho-vivo dark:text-red-400 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-verde-pastel dark:bg-green-900/20 border-l-4 border-verde-agua dark:border-green-500 text-verde-agua dark:text-green-400 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{success}</p>
                </div>
              )}

              {/* Nome Completo */}
              <div>
                <label className="text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João da Silva"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className=" text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                />
              </div>

              {/* Termos e Condições */}
              <div className="bg-azul-pastel dark:bg-azul-claro/20  rounded-lg p-4 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 accent-azul-royal rounded focus:ring-2 focus:ring-azul-royal cursor-pointer"
                  />
                  <div className="text-sm text-cinza dark:text-gray-400">
                    <span className="font-semibold">Li e aceito o </span>
                    <Link href="/termos" className="text-azul-royal dark:text-azul-claro hover:text-azul-royal font-bold">
                      Termos e Condições
                    </Link>
                    {' '}e a{' '}
                    <Link href="/privacidade" className="text-azul-royal dark:text-azul-claro hover:text-azul-royal font-bold">
                      Política de Privacidade
                    </Link>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-azul-royal dark:bg-azul-claro dark:border-azul-claro text-white py-3 cursor-pointer rounded-full font-bold text-lg hover:bg-branco dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal border dark:hover:border-amarelo-gold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <p className="text-center text-cinza dark:text-gray-400 mt-4">
                Já tem conta?{' '}
                <Link href="/auth/login" className="text-azul-royal dark:text-azul-claro hover:text-azul-royal font-bold">
                  Faça login
                </Link>
              </p>

              <div className="text-center mt-6">
                <Link href="/" className="text-cinza dark:text-gray-400 hover:text-azul-royal dark:hover:text-azul-claro font-semibold text-sm">
                  ← Voltar para Início
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    )
  }
