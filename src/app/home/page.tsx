'use client'

import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Search, TrendingUp, Lock, Zap, DollarSign, Target, Smartphone, Trophy } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/campanhas')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Concorra a Prêmios Incríveis
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Cotas a partir de R$ 0,50 • Sorteios transparentes • Prêmios garantidos
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold transition transform hover:scale-105 shadow-lg"
              >
                🚀 Começar Agora
              </Link>
              <Link
                href="/auth/login"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">2.5K+</div>
              <div className="text-gray-600">Rifas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">50K+</div>
              <div className="text-gray-600">Cotas Vendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">2.547</div>
              <div className="text-gray-600">Ganhadores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">R$ 2,8M</div>
              <div className="text-gray-600">Em Prêmios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Como Funciona Section */}
      <div className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Como Funciona?</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-2xl mx-auto">
            Três passos simples para começar a participar de incríveis sorteios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Criar ou Entrar</h3>
              <p className="text-gray-600">
                Crie sua conta em segundos ou entre se já tem. Sem burocracia, sem documentos chatos.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Escolha ou Crie</h3>
              <p className="text-gray-600">
                Participe de rifas criadas por outros usuários ou crie a sua com seus próprios prêmios.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ganhe Prêmios!</h3>
              <p className="text-gray-600">
                Compre cotas e acompanhe o sorteio em tempo real. Se ganhar, receba seu prêmio do jeito que escolher.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-800 text-white py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Por que Tronco da Sorte?</h2>
          <p className="text-lg text-gray-300 mb-16 text-center max-w-2xl mx-auto">
            Somos a plataforma mais confiável e transparente de rifas online
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Lock className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Totalmente Seguro</h3>
                <p className="text-gray-300">Seus dados estão protegidos com criptografia de ponta. Sorteios auditados e transparentes.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Zap className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Super Rápido</h3>
                <p className="text-gray-300">Características e transações instantâneas. Sem burocracias nem atrasos.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <DollarSign className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cotas Acessíveis</h3>
                <p className="text-gray-300">A partir de R$ 0,50 por cota. Todos podem participar e ganhar prêmios incríveis.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Target className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Prêmios Reais</h3>
                <p className="text-gray-300">Prêmios verificados e reais. De iPhones até viagens internacionais.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Smartphone className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Mobile Friendly</h3>
                <p className="text-gray-300">Funciona perfeitamente em qualquer dispositivo. Participe de qualquer lugar.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Trophy className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Sorteios Justos</h3>
                <p className="text-gray-300">Sistema de sorteio aleatório certificado. Todos têm chances iguais de ganhar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-emerald-100 mb-12 font-semibold">
            Junte-se a milhares de pessoas que já estão ganhando prêmios incríveis no Tronco da Sorte
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-emerald-600 px-12 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition transform hover:scale-105 shadow-lg"
          >
            Comece Agora Mesmo 🚀
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 Tronco da Sorte. Todos os direitos reservados.</p>
          <p className="mt-2">A plataforma de rifas online mais segura e divertida do Brasil</p>
        </div>
      </div>
    </div>
  )
}
