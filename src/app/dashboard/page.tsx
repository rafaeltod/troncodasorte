'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/raffle-card'
import Link from 'next/link'

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
  creator: {
    name: string
    email: string
  }
  userQuotas?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'created' | 'participating' | 'finished' | 'available'>('available')
  
  const [createdRaffles, setCreatedRaffles] = useState<Raffle[]>([])
  const [participatingRaffles, setParticipatingRaffles] = useState<Raffle[]>([])
  const [finishedRaffles, setFinishedRaffles] = useState<Raffle[]>([])
  const [availableRaffles, setAvailableRaffles] = useState<Raffle[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    const fetchRaffles = async () => {
      try {
        // Buscar todas as categorias em paralelo
        const [created, participating, finished, available] = await Promise.all([
          fetch(`/api/raffles/user/${user.id}/created`, { credentials: 'include' }).then(r => r.json()),
          fetch(`/api/raffles/user/${user.id}/participating`, { credentials: 'include' }).then(r => r.json()),
          fetch(`/api/raffles/user/${user.id}/finished`, { credentials: 'include' }).then(r => r.json()),
          fetch(`/api/raffles/user/${user.id}/available`, { credentials: 'include' }).then(r => r.json()),
        ])

        setCreatedRaffles(Array.isArray(created) ? created : [])
        setParticipatingRaffles(Array.isArray(participating) ? participating : [])
        setFinishedRaffles(Array.isArray(finished) ? finished : [])
        setAvailableRaffles(Array.isArray(available) ? available : [])
      } catch (err) {
        console.error('Erro ao buscar rifas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRaffles()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getActiveRaffles = () => {
    switch (activeTab) {
      case 'created':
        return createdRaffles
      case 'participating':
        return participatingRaffles
      case 'finished':
        return finishedRaffles
      case 'available':
        return availableRaffles
      default:
        return []
    }
  }

  const getTabLabel = () => {
    switch (activeTab) {
      case 'created':
        return `Minhas Rifas (${createdRaffles.length})`
      case 'participating':
        return `Participando (${participatingRaffles.length})`
      case 'finished':
        return `Finalizadas (${finishedRaffles.length})`
      case 'available':
        return `Rifas Disponíveis (${availableRaffles.length})`
      default:
        return ''
    }
  }

  const tabs = [
    { id: 'available' as const, label: `Disponíveis (${availableRaffles.length})`, icon: '🎯' },
    { id: 'created' as const, label: `Minhas (${createdRaffles.length})`, icon: '👑' },
    { id: 'participating' as const, label: `Participando (${participatingRaffles.length})`, icon: '🎫' },
    { id: 'finished' as const, label: `Finalizadas (${finishedRaffles.length})`, icon: '✅' },
  ]

  const activeRaffles = getActiveRaffles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-3">
            👋 Olá, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Bem-vindo ao seu painel de rifas. Explore, participe e crie suas próprias rifas!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/criar-rifa"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg text-center"
            >
              🚀 Criar Nova Rifa
            </Link>
            <Link
              href="/historico"
              className="bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg text-center"
            >
              📊 Meu Histórico
            </Link>
            <Link
              href="/account"
              className="bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg text-center"
            >
              👤 Meu Perfil
            </Link>
            <Link
              href="/top-compradores"
              className="bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold border-2 border-indigo-600 hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg text-center"
            >
              🏆 Top Compradores
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-indigo-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeRaffles.length > 0 ? (
            <>
              <h2 className="text-3xl font-black text-slate-900 mb-6">{getTabLabel()}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} {...raffle} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-lg">
              <div className="text-5xl mb-4">
                {activeTab === 'available' && '🔍'}
                {activeTab === 'created' && '📝'}
                {activeTab === 'participating' && '🎫'}
                {activeTab === 'finished' && '🏁'}
              </div>
              <p className="text-xl text-slate-600 mb-6 font-semibold">
                {activeTab === 'available' && 'Nenhuma rifa disponível no momento'}
                {activeTab === 'created' && 'Você ainda não criou nenhuma rifa'}
                {activeTab === 'participating' && 'Você ainda não está participando de nenhuma rifa'}
                {activeTab === 'finished' && 'Você ainda não finalizou nenhuma rifa'}
              </p>
              {(activeTab === 'available' || activeTab === 'created') && (
                <Link
                  href="/criar-rifa"
                  className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  Começar Agora 🚀
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
