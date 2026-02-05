'use client'

import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-8">
              <span className="text-8xl drop-shadow-lg">🎲</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 leading-tight">
              Bem-vindo ao
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tronco da Sorte
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-semibold">
              A plataforma de rifas online mais segura e divertida do Brasil. Crie suas rifas, participe de sorteios e ganhe prêmios incríveis!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
              >
                ✨ Começar Agora
              </Link>
              <Link
                href="/#features"
                className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg"
              >
                📚 Saiba Mais
              </Link>
            </div>

            <p className="text-slate-600">
              Fácil • Seguro • Rápido
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2">10K+</div>
              <div className="text-indigo-100 font-semibold">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2">50K+</div>
              <div className="text-indigo-100 font-semibold">Rifas Criadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2">R$ 5M+</div>
              <div className="text-indigo-100 font-semibold">Em Prêmios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2">100%</div>
              <div className="text-indigo-100 font-semibold">Seguro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 text-center">Como Funciona?</h2>
          <p className="text-lg text-slate-600 mb-16 text-center max-w-2xl mx-auto">
            Três passos simples para começar a participar de incríveis sorteios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Criar ou Entrar</h3>
              <p className="text-slate-600">
                Crie sua conta em segundos ou entre se já tem. Sem burocracia, sem documentos chatos.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Escolha ou Crie</h3>
              <p className="text-slate-600">
                Participe de rifas criadas por outros usuários ou crie a sua com seus próprios prêmios.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Ganhe Prêmios!</h3>
              <p className="text-slate-600">
                Compre cotas e acompanhe o sorteio em tempo real. Se ganhar, receba seu prêmio do jeito que escolher.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-slate-900 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 text-center">Por que Tronco da Sorte?</h2>
          <p className="text-lg text-slate-300 mb-16 text-center max-w-2xl mx-auto">
            Somos a plataforma mais confiável e transparente de rifas online
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-4xl">🔒</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Totalmente Seguro</h3>
                <p className="text-slate-300">Seus dados estão protegidos com criptografia de ponta. Sorteios auditados e transparentes.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Super Rápido</h3>
                <p className="text-slate-300">Características e transações instantâneas. Sem burocracias nem atrasos.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-4xl">💰</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Cotas Acessíveis</h3>
                <p className="text-slate-300">A partir de R$ 0,50 por cota. Todos podem participar e ganhar prêmios incríveis.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Prêmios Reais</h3>
                <p className="text-slate-300">Prêmios verificados e reais. De iPhones até viagens internacionais.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-4xl">📱</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Mobile Friendly</h3>
                <p className="text-slate-300">Funciona perfeitamente em qualquer dispositivo. Participe de qualquer lugar.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Sorteios Justos</h3>
                <p className="text-slate-300">Sistema de sorteio aleatório certificado. Todos têm chances iguais de ganhar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 font-semibold">
            Junte-se a milhares de pessoas que já estão ganhando prêmios incríveis no Tronco da Sorte
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-indigo-600 px-12 py-4 rounded-xl font-black text-lg hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg"
          >
            Comece Agora Mesmo 🚀
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 Tronco da Sorte. Todos os direitos reservados.</p>
          <p className="mt-2">A plataforma de rifas online mais segura e divertida do Brasil</p>
        </div>
      </div>
    </div>
  )
}
