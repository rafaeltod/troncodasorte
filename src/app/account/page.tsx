'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600">⏳ Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalQuotas = purchases.reduce((acc, p) => acc + p.quotas, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black text-slate-900 mb-10">👤 Minha Conta</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Perfil */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">📋 Informações Pessoais</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                {editing ? '❌ Cancelar' : '✏️ Editar'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-600 text-green-700 p-4 rounded-lg mb-4">
                {success}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-slate-900 font-bold text-sm mb-2">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold text-sm mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-600 bg-slate-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-2">CPF</label>
                    <input
                      type="text"
                      value={user.cpf}
                      disabled
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-600 bg-slate-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  💾 Salvar Alterações
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 font-semibold text-sm">Nome</p>
                    <p className="text-slate-900 font-bold text-lg">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold text-sm">Telefone</p>
                    <p className="text-slate-900 font-bold text-lg">{user.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 font-semibold text-sm">Email</p>
                    <p className="text-slate-900 font-bold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold text-sm">CPF</p>
                    <p className="text-slate-900 font-bold">{user.cpf}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-600 font-semibold text-sm">Membro desde</p>
                  <p className="text-slate-900 font-bold">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <p className="text-indigo-100 font-semibold text-sm">Cotas Adquiridas</p>
              <p className="text-4xl font-black mt-2">{totalQuotas}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <p className="text-purple-100 font-semibold text-sm">Total Gasto</p>
              <p className="text-3xl font-black mt-2">R$ {Number(totalSpent).toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <p className="text-pink-100 font-semibold text-sm">Rifas Participadas</p>
              <p className="text-4xl font-black mt-2">{purchases.length}</p>
            </div>
          </div>
        </div>

        {/* Histórico de Compras */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6">📊 Histórico de Compras</h2>

          {purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Link key={purchase.id} href={`/rifas/${purchase.raffleId}`}>
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 p-4 rounded-lg border border-slate-200 cursor-pointer transition transform hover:scale-102">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-lg">
                          {purchase.raffle?.title || 'Rifa'}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          {purchase.quotas} cota(s) • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-600 text-lg">
                          R$ {Number(purchase.amount).toFixed(2)}
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                          purchase.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
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
              <p className="text-slate-600 text-lg mb-4">Você ainda não participou de nenhuma rifa</p>
              <Link
                href="/rifas"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                Explorar Rifas 🎯
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
