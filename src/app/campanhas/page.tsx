'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { RaffleCard } from '@/components/raffle-card'
import { Search, TrendingUp } from 'lucide-react'

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

export default function RafflesPage() {
  const { loading: authLoading } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [filteredRaffles, setFilteredRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/campanhas')
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
        setFilteredRaffles(data)
      }
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredRaffles(raffles)
    } else {
      const filtered = raffles.filter(raffle =>
        raffle.title.toLowerCase().includes(term.toLowerCase()) ||
        raffle.description?.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredRaffles(filtered)
    }
  }

  useEffect(() => {
    fetchRaffles()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-4">
              Campanhas em Destaque
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Escolha uma campanha e comece a participar! Quanto mais cotas, maior sua chance de ganhar!
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raffles Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Campanhas Disponíveis
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-gray-700">⏳ Carregando campanhas...</p>
          </div>
        ) : filteredRaffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaffles.map((raffle) => (
              <RaffleCard key={raffle.id} {...raffle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-gray-700">😔 {searchTerm ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha disponível'}</p>
            <p className="text-gray-600 text-lg mt-2">
              {searchTerm ? 'Tente outro termo de busca.' : 'Volte em breve para novas oportunidades!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
