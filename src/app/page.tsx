'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, refetch } = useAuth()
  const [tab, setTab] = useState<'home' | 'login' | 'register'>('home')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    cpf: '',
    phone: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer login')
      }

      await refetch()
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar conta')
      }

      await refetch()
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
      setIsLoading(false)
    }
  }

  // HOME PAGE
  if (tab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center mb-16">
            <span className="text-7xl md:text-8xl block mb-6">🎲</span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6">
              Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Tronco da Sorte</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto">
              A plataforma de rifas online mais segura e divertida do Brasil. Participe, crie e ganhe prêmios incríveis!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setTab('register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
              >
                🚀 Começar Agora
              </button>
              <button
                onClick={() => setTab('login')}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg"
              >
                🔐 Fazer Login
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20">
            <div className="bg-white rounded-xl shadow p-6 text-center border border-slate-100">
              <div className="text-3xl font-black text-indigo-600 mb-2">10k+</div>
              <div className="text-slate-600 font-semibold">Usuários</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center border border-slate-100">
              <div className="text-3xl font-black text-purple-600 mb-2">5k+</div>
              <div className="text-slate-600 font-semibold">Rifas</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center border border-slate-100">
              <div className="text-3xl font-black text-pink-600 mb-2">R$500k</div>
              <div className="text-slate-600 font-semibold">Em Prêmios</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center border border-slate-100">
              <div className="text-3xl font-black text-green-600 mb-2">24/7</div>
              <div className="text-slate-600 font-semibold">Disponível</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-black text-white mb-12 text-center">Como Funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-white">
                <div className="text-6xl mb-4">1️⃣</div>
                <h3 className="text-2xl font-black mb-3">Crie Conta</h3>
                <p className="text-indigo-100">Registre-se em segundos e comece a explorar rifas.</p>
              </div>
              <div className="text-white">
                <div className="text-6xl mb-4">2️⃣</div>
                <h3 className="text-2xl font-black mb-3">Compre Cotas</h3>
                <p className="text-indigo-100">Cotas a partir de R$ 0,50. Quanto mais, maior a chance!</p>
              </div>
              <div className="text-white">
                <div className="text-6xl mb-4">3️⃣</div>
                <h3 className="text-2xl font-black mb-3">Ganhe Prêmios</h3>
                <p className="text-indigo-100">Acompanhe sorteios em tempo real e ganhe!</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Pronto para começar?</h2>
          <button
            onClick={() => setTab('register')}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition"
          >
            Criar Conta Grátis 🚀
          </button>
        </div>
      </div>
    )
  }

  // LOGIN/REGISTER PAGE
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <button
            onClick={() => setTab('home')}
            className="text-slate-600 hover:text-slate-900 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎲</div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Tronco da Sorte</h1>
            <p className="text-slate-600">Plataforma de Rifas Online</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setTab('login')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setTab('register')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                tab === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-bold">❌ {error}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-2">📧 Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-2">🔐 Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Entrando...' : '✨ Entrar'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">👤 Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">📧 Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">🆔 CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                  placeholder="123.456.789-00"
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">📱 Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">🔐 Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-1">🔐 Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Criando conta...' : '✨ Criar Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
