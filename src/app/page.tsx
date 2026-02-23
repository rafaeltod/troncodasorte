'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/lote-card'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Zap } from 'lucide-react'
import { mainConfig } from '../lib/layout-config'

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'drawn'>('all')

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/lotes')
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
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

  const handleStatusFilter = (status: 'all' | 'open' | 'closed' | 'drawn') => {
    setStatusFilter(status)
    applyFilters(searchTerm, status)
  }

  const applyFilters = (term: string, status: 'all' | 'open' | 'closed' | 'drawn') => {
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

  useEffect(() => {
    applyFilters(searchTerm, statusFilter)
  }, [raffles])

  // Contagens por status
  const totalCount = raffles.length
  const openCount = raffles.filter(r => r.status === 'open').length
  const closedCount = raffles.filter(r => r.status === 'closed').length
  const drawnCount = raffles.filter(r => r.status === 'drawn').length

  return (
    <div className="min-h-screen bg-fundo-cinza max-w-screen">
      {/* Rafles Grid */}
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl font-bold text-cinza">Carregando lotes...</div>
        </div>
      ) : filteredRaffles.length === 0 ? (
        <div className={mainConfig}>
          <p className="text-xl text-cinza">Nenhuma lote encontrada</p>
        </div>
      ) : (
        <div className={mainConfig}>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <input
          type="text"
          placeholder="Pesquisar lotes por título ou descrição..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-6 pr-14 py-3 rounded-full bg-white text-cinza placeholder-cinza border-2 border-azul-claro focus:outline-none focus:ring-1 focus:ring-azul-royal"
        />
        <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mt-4 flex-wrap mb-4">
        <button
          onClick={() => handleStatusFilter('all')}
          className={`px-3 py-1 md:px-6 md:py-2 cursor-pointer rounded-full font-bold transition ${statusFilter === 'all' ? 'bg-azul-claro text-white' : 'bg-white text-azul-claro border-2 border-azul-claro hover:bg-azul-pastel'}`}
        >
          Tudo ({totalCount})
        </button>
        <button
          onClick={() => handleStatusFilter('open')}
          className={`px-3 py-1 md:px-6 md:py-2 cursor-pointer rounded-full font-bold transition ${statusFilter === 'open' ? 'bg-azul-claro text-white' : 'bg-white text-azul-claro border-2 border-azul-claro hover:bg-azul-pastel'}`}
        >
          Abertas ({openCount})
        </button>
        <button
          onClick={() => handleStatusFilter('closed')}
          className={`px-3 py-1 md:px-6 md:py-2 cursor-pointer rounded-full font-bold transition ${statusFilter === 'closed' ? 'bg-azul-claro text-white' : 'bg-white text-azul-claro border-2 border-azul-claro hover:bg-azul-pastel'}`}
        >
          Fechadas ({closedCount})
        </button>
        <button
          onClick={() => handleStatusFilter('drawn')}
          className={`px-3 py-1 md:px-6 md:py-2 cursor-pointer rounded-full font-bold transition ${statusFilter === 'drawn' ? 'bg-azul-claro text-white' : 'bg-white text-azul-claro border-2 border-azul-claro hover:bg-azul-pastel'}`}
        >
          Sorteadas ({drawnCount})
        </button>
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.id}
                id={raffle.id}
                title={raffle.title}
                description={raffle.description}
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
