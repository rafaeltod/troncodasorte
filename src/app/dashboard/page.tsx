'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import { RaffleCard } from '@/components/lote-card'
import Link from 'next/link'
import { Plus, History, Trophy, Users } from 'lucide-react'

interface Raffle {
  id: string
  title: string
  description: string
  prizeAmount: number
  livroPrice: number
  totalLivros: number
  soldLivros: number
  status: string
  image?: string
  createdAt: string
  creator: {
    name: string
    email: string
  }
  userLivros?: number
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
        console.error('Erro ao buscar lotes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRaffles()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
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
        return `Minhas Lotes (${createdRaffles.length})`
      case 'participating':
        return `Participando (${participatingRaffles.length})`
      case 'finished':
        return `Finalizadas (${finishedRaffles.length})`
      case 'available':
        return `Lotes Disponíveis (${availableRaffles.length})`
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-3">
            👋 Olá, {censorName(user.name).split(' ')[0]}!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Bem-vindo ao seu painel de lotes. Explore, participe e crie suas próprias lotes!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/criar-lote"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition transform hover:scale-105 shadow-lg text-center"
            >
              <Plus className="inline mr-2" size={20} /> Criar Nova Rifa
            </Link>
            <Link
              href="/historico"
              className="bg-white text-emerald-600 px-6 py-4 rounded-xl font-bold border-2 border-emerald-600 hover:bg-emerald-50 transition transform hover:scale-105 shadow-lg text-center"
            >
              <History className="inline mr-2" size={20} /> Meu Histórico
            </Link>
            <Link
              href="/account"
              className="bg-white text-emerald-600 px-6 py-4 rounded-xl font-bold border-2 border-emerald-600 hover:bg-emerald-50 transition transform hover:scale-105 shadow-lg text-center"
            >
              👤 Meu Perfil
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
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-emerald-600'
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
              <h2 className="text-3xl font-black text-gray-900 mb-6">{getTabLabel()}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} {...raffle} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-lg">
              <div className="text-5xl mb-4">
                {activeTab === 'available' && '🔍'}
                {activeTab === 'created' && '📝'}
                {activeTab === 'participating' && '🎫'}
                {activeTab === 'finished' && '🏁'}
              </div>
              <p className="text-xl text-gray-600 mb-6 font-semibold">
                {activeTab === 'available' && 'Nenhuma rifa disponível no momento'}
                {activeTab === 'created' && 'Você ainda não criou nenhuma rifa'}
                {activeTab === 'participating' && 'Você ainda não está participando de nenhuma rifa'}
                {activeTab === 'finished' && 'Você ainda não finalizou nenhuma rifa'}
              </p>
              {(activeTab === 'available' || activeTab === 'created') && (
                <Link
                  href="/criar-lote"
                  className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
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
