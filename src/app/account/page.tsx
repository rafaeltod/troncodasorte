'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { censorName, censorPhone } from '@/lib/formatters'
import { User, Mail, FileText, Phone, Calendar, Ticket, ShoppingBag, Edit2, Save, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  birthDate?: string
  phoneConfirmed?: boolean
  createdAt: string
}

interface Purchase {
  id: string
  raffleId: string
  quotas: number
  amount: number
  status: string
  createdAt: string
  raffle?: {
    title: string
    prizeAmount: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const { user: authUser, loading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (loading) return
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const fetchPurchases = async (userId: string) => {
      try {
        const response = await fetch(`/api/users/${userId}/purchases`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setPurchases(data)
        }
      } catch (err) {
        console.error('Error fetching purchases:', err)
      } finally {
        setPageLoading(false)
      }
    }

    setUser(authUser)
    setFormData({
      name: authUser.name,
      phone: authUser.phone,
    })
    fetchPurchases(authUser.id)
  }, [loading, authUser, router])

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/users/${user?.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil')
      }

      const updatedUser = await response.json()
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccess('✅ Perfil atualizado com sucesso!')
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    }
  }

  if (!user) {
    return null
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalQuotas = purchases.reduce((acc, p) => acc + p.quotas, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 overflow-hidden">
              <Image 
                src="/troncodasorte.png"
                alt="Tronco da Sorte"
                width={60}
                height={60}
                priority
              />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Minha Conta</h1>
              <p className="text-gray-600">Gerenciar informações e histórico de compras</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Perfil */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Informações Pessoais
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                {editing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 p-4 rounded-lg mb-6">
                {success}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      CPF
                    </label>
                    <input
                      type="text"
                      value={user.cpf}
                      disabled
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-extrabold hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-emerald-600" />
                      Nome
                    </p>
                    <p className="text-gray-900 font-black text-lg">{censorName(user.name)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      Telefone
                    </p>
                    <p className="text-gray-900 font-black text-lg">{censorPhone(user.phone)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Email
                    </p>
                    <p className="text-gray-900 font-black">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      CPF
                    </p>
                    <p className="text-gray-900 font-black">{user.cpf}</p>
                  </div>
                </div>

                {user.birthDate && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Data de Nascimento
                    </p>
                    <p className="text-gray-900 font-black">{user.birthDate}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-600 font-semibold text-sm flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Membro desde
                  </p>
                  <p className="text-gray-900 font-black">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-5 h-5" />
                <p className="text-emerald-100 font-semibold text-sm">Cotas Adquiridas</p>
              </div>
              <p className="text-4xl font-black">{totalQuotas}</p>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <p className="text-teal-100 font-semibold text-sm">Rifas Participadas</p>
              </div>
              <p className="text-4xl font-black">{purchases.length}</p>
            </div>
          </div>
        </div>

        {/* Histórico de Compras */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 max-w-6xl mx-auto mt-8">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            Histórico de Compras
          </h2>

          {purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Link key={purchase.id} href={`/compra/${purchase.id}`}>
                  <div className="bg-gradient-to-r from-gray-50 to-emerald-50 hover:from-emerald-50 hover:to-teal-50 p-6 rounded-lg border border-gray-200 cursor-pointer transition transform hover:scale-102 hover:border-emerald-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-black text-gray-900 text-lg mb-2">
                          {purchase.raffle?.title || 'Rifa'}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-emerald-600" />
                          {purchase.quotas} cota{purchase.quotas !== 1 ? 's' : ''} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-700 text-lg mb-2">
                          R$ {Number(purchase.amount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          purchase.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {purchase.status === 'completed' ? '✅ Confirmada' : '⏳ Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-6">Você ainda não participou de nenhuma campanha</p>
              <Link
                href="/campanhas"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition transform hover:scale-105"
              >
                <Ticket className="w-5 h-5" />
                Explorar Campanhas
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
