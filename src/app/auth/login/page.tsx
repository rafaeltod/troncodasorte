'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Receber cookies
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer login')
      }

      const data = await response.json()
      login(data.user, data.token)
      
      // Aguardar para garantir que o cookie foi definido
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎲</div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Entrar</h1>
            <p className="text-slate-600">Acesse sua conta no Tronco da Sorte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
                <p className="font-bold">❌ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-slate-900 font-bold text-sm mb-2">
                📧 Email
              </label>
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
              <label className="block text-slate-900 font-bold text-sm mb-2">
                🔐 Senha
              </label>
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Entrando...' : '✨ Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-slate-600 text-center mb-3">
              Não tem conta?
            </p>
            <Link
              href="/auth/register"
              className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-lg transition"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
