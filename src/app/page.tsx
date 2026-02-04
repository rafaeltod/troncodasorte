'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/raffle-card'

interface Raffle {
  id: string
  title: string
  description: string
  prizeAmount: number
  quotaPrice: number
  totalQuotas: number
  soldQuotas: number
  status: string
  image?: string
  createdAt: string
}

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedAuth, setCheckedAuth] = useState(false)

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/rifas')
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
      }
    } catch (err) {
      console.error('Erro ao buscar rifas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) {
      console.log('[Home] Still loading auth...')
      return
    }
    
    console.log('[Home] Auth check complete. isAuthenticated:', isAuthenticated)
    setCheckedAuth(true)
    
    if (!isAuthenticated) {
      console.log('[Home] Not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }

    console.log('[Home] Authenticated, fetching raffles')
    fetchRaffles()
  }, [isAuthenticated, authLoading, router])

  if (authLoading || !checkedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Verificando autenticação...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  const activeRaffles = raffles.filter((r) => r.status === 'open')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <div className="mb-6 inline-block">
            <span className="text-6xl md:text-7xl">🎲</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Bem-vindo ao Tronco da Sorte
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto">
            A plataforma de rifas online mais segura e divertida do Brasil
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/rifas"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg"
            >
              ✨ Explorar Rifas
            </Link>
            <Link
              href="/criar-rifa"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg"
            >
              🚀 Criar Minha Rifa
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{raffles.length}</div>
              <div className="text-indigo-100 font-semibold">Rifas Totais</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{activeRaffles.length}</div>
              <div className="text-indigo-100 font-semibold">Rifas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                {raffles.reduce((acc, r) => acc + r.soldQuotas, 0)}
              </div>
              <div className="text-indigo-100 font-semibold">Cotas Vendidas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                R$ {(raffles.reduce((acc, r) => acc + r.prizeAmount, 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-indigo-100 font-semibold">Em Prêmios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Raffles */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4">🌟 Rifas em Destaque</h2>
        <p className="text-lg text-slate-600 mb-10">Confira os prêmios mais incríveis do momento</p>
        {activeRaffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeRaffles.slice(0, 4).map((raffle) => (
              <RaffleCard key={raffle.id} {...raffle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-xl text-slate-600 mb-6">Nenhuma rifa ativa no momento</p>
            <Link
              href="/criar-rifa"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Seja o Primeiro 🎯
            </Link>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-black text-white mb-4 text-center">Como Funciona</h2>
          <p className="text-lg text-slate-300 mb-12 text-center max-w-2xl mx-auto">
            Três passos simples para começar a participar de incríveis sorteios
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-2xl shadow-xl text-white">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="font-black text-2xl mb-3">Escolha uma Rifa</h3>
              <p className="text-indigo-100">
                Navegue por nossas rifas ativas e escolha o prêmio que mais te atrai
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl shadow-xl text-white">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="font-black text-2xl mb-3">Compre Cotas</h3>
              <p className="text-purple-100">
                Cada cota custa apenas R$ 0,50. Quanto mais cotas, mais chances de ganhar!
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 rounded-2xl shadow-xl text-white">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="font-black text-2xl mb-3">Ganhe Prêmios</h3>
              <p className="text-pink-100">
                Acompanhe o sorteio em tempo real e receba seus prêmios se ganhar!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Junte-se a milhares de pessoas que já estão participando de sorteios incríveis
          </p>
          <Link
            href="/rifas"
            className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-black text-lg hover:bg-indigo-50 transition transform hover:scale-105"
          >
            Explorar Todas as Rifas 🎊
          </Link>
        </div>
      </div>
    </div>
  )
}
