'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/lote-card'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Zap } from 'lucide-react'

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
}

export default function Home() {
  const { loading: authLoading } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [filteredRaffles, setFilteredRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open')

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/lotes')
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
        setFilteredRaffles(data)
      }
    } catch (err) {
      console.error('Erro ao buscar lotes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, statusFilter)
  }

  const handleStatusFilter = (status: 'all' | 'open' | 'closed') => {
    setStatusFilter(status)
    applyFilters(searchTerm, status)
  }

  const applyFilters = (term: string, status: 'all' | 'open' | 'closed') => {
    let filtered = raffles

    // Filtrar por status
    if (status !== 'all') {
      filtered = filtered.filter(raffle => raffle.status === status)
    }

    // Filtrar por busca
    if (term.trim()) {
      filtered = filtered.filter(raffle =>
        raffle.title.toLowerCase().includes(term.toLowerCase()) ||
        raffle.description?.toLowerCase().includes(term.toLowerCase())
      )
    }

    // Quando mostrar "Todas", ordena: abertos primeiro, depois fechados/sorteados
    if (status === 'all') {
      filtered = filtered.sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1
        if (a.status !== 'open' && b.status === 'open') return 1
        return 0
      })
    }

    setFilteredRaffles(filtered)
  }

  useEffect(() => {
    fetchRaffles()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Escolha uma Lote</h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Selecione os livros e a quantidade que deseja. Quanto mais livros, maior sua chance de ganhar!
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar lotes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur text-white placeholder-emerald-100 border border-emerald-300 focus:border-white focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={() => handleStatusFilter('all')}
                className={`px-6 py-2 rounded-full font-bold transition ${statusFilter === 'all' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                ✨ Todas as Lotes
              </button>
              <button
                onClick={() => handleStatusFilter('open')}
                className={`px-6 py-2 rounded-full font-bold transition ${statusFilter === 'open' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                🟢 Disponíveis
              </button>
              <button
                onClick={() => handleStatusFilter('closed')}
                className={`px-6 py-2 rounded-full font-bold transition ${statusFilter === 'closed' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                🔴 Fechadas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rafles Grid */}
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl font-bold text-gray-600">⏳ Carregando lotes...</div>
        </div>
      ) : filteredRaffles.length === 0 ? (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600">Nenhuma lote encontrada</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.id}
                id={raffle.id}
                title={raffle.title}
                image={raffle.image}
                prizeAmount={raffle.prizeAmount}
                totalLivros={raffle.totalLivros}
                soldLivros={raffle.soldLivros}
                livroPrice={raffle.livroPrice}
                status={raffle.status}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
