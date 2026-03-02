'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { LogIn, FileText, Phone, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react'

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
      if (user.isVendedor) {
        router.push('/vendedor')
      } else {
        router.push('/')
      }
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
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // Atualizar context imediatamente
      const success = await refetch()

      setSuccess('Login realizado com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Redirect baseado no tipo de usuário
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData.user?.isVendedor) {
          router.push('/vendedor')
          return
        }
      }
      router.push('/')
    } catch (err) {
      console.error('[LoginPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="cursor-pointer fixed top-6 right-6 p-3 rounded-full bg-branco dark:bg-[#232F3E] border-2 border-cinza-claro dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        aria-label="Alternar tema"
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-amarelo-pastel" />
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
            <h1 className="text-3xl font-black text-cinza dark:text-cinza-claro mb-2">Entrar</h1>
            <p className="text-cinza dark:text-gray-400">Acesse sua conta no Tronco da Sorte</p>
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
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-verde-agua dark:border-emerald-500 text-verde-agua dark:text-emerald-400 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold">{success}</p>
                </div>
              )}

              {/* CPF Input */}
              <div>
                <label className=" text-cinza dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro dark:border-gray-700 focus:border-azul-royal focus:outline-none bg-fundo-cinza dark:bg-[#1a2332] text-cinza dark:text-cinza-claro"
                  autoFocus
                />
              </div>

              {/* Phone Input */}
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

              <p className="text-xs text-cinza dark:text-gray-400 text-center">* Campos obrigatórios</p>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-azul-royal dark:border-azul-claro dark:hover:border-amarelo-gold  dark:bg-azul-claro text-branco hover:bg-branco dark:hover:bg-amarelo-claro hover:text-azul-royal dark:hover:text-azul-royal border-2 py-3 rounded-full font-bold text-lg cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cinza-claro dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-branco dark:bg-[#232F3E] text-cinza dark:text-gray-400 font-semibold">Não tem conta?</span>
                </div>
              </div>

              <Link href="/auth/register" className="w-full block">
                <button
                  type="button"
                  className="w-full bg-white dark:bg-amarelo-pastel border-2 cursor-pointer border-azul-royal dark:border-amarelo-claro text-azul-royal dark:text-azul-royal hover:bg-azul-royal dark:hover:bg-amarelo-claro hover:text-branco dark:hover:text-azul-royal py-3 rounded-full font-bold text-lgtransition"
                >
                  Criar Conta
                </button>
              </Link>

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
