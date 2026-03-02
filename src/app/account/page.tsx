'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { formatDecimal } from '@/lib/formatters'
import { censorName, censorPhoneShort } from '@/lib/formatters'
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
  livros: number
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
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
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
      setSuccess('Perfil atualizado com sucesso!')
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    }
  }

  if (!user) {
    return null
  }

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0)
  const totalLivros = purchases.reduce((acc, p) => acc + p.livros, 0)

  return (
    <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-fulloverflow-hidden">
              <Image 
                src="/troncodasorte.png"
                alt="Tronco da Sorte"
                width={60}
                height={60}
                priority
              />
            </div>
            <div>
              <h1 className="text-4xl font-black text-cinza-escuro dark:text-cinza-claro">Minha Conta</h1>
              <p className="text-cinza dark:text-gray-400">Gerenciar informações e histórico de compras</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Perfil */}
          <div className="lg:col-span-2 bg-branco dark:bg-[#232F3E] rounded-2xl shadow-lg p-8 border border-cinza-claro dark:border-gray-700">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-cinza dark:text-cinza-claro flex items-center gap-2">
                Informações Pessoais
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 bg-azul-royal dark:bg-azul-claro hover:bg-branco hover:text-azul-royal dark:hover:bg-amarelo-claro dark:hover:text-azul-royal border cursor-pointer text-branco px-4 py-2 rounded-full font-bold transition"
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
              <div className="bg-vermelho-pastel dark:bg-red-900/20 text-vermelho-vivo dark:text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-azul-pastel dark:bg-azul-claro/20 border-l-4 border-azul-royal dark:border-azul-claro text-azul-royal dark:text-azul-claro p-4 rounded-lg mb-6">
                {success}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="text-cinza-escuro dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-lg px-4 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-royal transition"
                  />
                </div>

                <div>
                  <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-lg px-4 py-3 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] focus:outline-none focus:border-azul-royal focus:ring-2 focus:ring-azul-royal transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-lg px-4 py-3 text-cinza dark:text-gray-500 bg-fundo-cinza dark:bg-[#1a2332] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className=" text-cinza-escuro dark:text-cinza-claro font-bold text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      CPF
                    </label>
                    <input
                      type="text"
                      value={user.cpf}
                      disabled
                      className="w-full border-2 border-cinza-claro dark:border-gray-700 rounded-lg px-4 py-3 text-cinza dark:text-gray-500 bg-fundo-cinza dark:bg-[#1a2332] cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-azul-royal dark:bg-azul-claro text-branco hover:bg-branco dark:hover:bg-amarelo-claro border hover:text-azul-royal dark:hover:text-azul-royal py-3 rounded-lg font-extrabold transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                    <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      Nome
                    </p>
                    <p className="text-cinza-escuro dark:text-cinza-claro font-black text-lg">{censorName(user.name)}</p>
                  </div>
                  <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                    <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      Telefone
                    </p>
                    <p className="text-cinza-escuro dark:text-cinza-claro font-black text-lg">{censorPhoneShort(user.phone)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                    <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      Email
                    </p>
                    <p className="text-cinza-escuro dark:text-cinza-claro font-black">{user.email}</p>
                  </div>
                  <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                    <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      CPF
                    </p>
                    <p className="text-cinza-escuro dark:text-cinza-claro font-black">{user.cpf}</p>
                  </div>
                </div>

                {user.birthDate && (
                  <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                    <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                      Data de Nascimento
                    </p>
                    <p className="text-cinza-escuro dark:text-cinza-claro font-black">{user.birthDate}</p>
                  </div>
                )}

                <div className="bg-fundo-cinza dark:bg-[#1a2332] p-4 rounded-lg border border-cinza-claro dark:border-gray-700">
                  <p className="text-cinza dark:text-gray-400 font-semibold text-sm flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                    Membro desde
                  </p>
                  <p className="text-cinza-escuro dark:text-cinza-claro font-black">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            <div className="bg-azul-royal dark:bg-azul-claro/20 rounded-2xl shadow-lg p-6 text-branco dark:text-azul-claro border dark:border-azul-claro/30">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-5 h-5" />
                <p className="text-branco dark:text-azul-claro font-semibold text-sm">Livros Adquiridas</p>
              </div>
              <p className="text-4xl font-black">{totalLivros}</p>
            </div>

            <div className="bg-azul-royal dark:bg-azul-claro/20 rounded-2xl shadow-lg p-6 text-branco dark:text-azul-claro border dark:border-azul-claro/30">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <p className="text-branco dark:text-azul-claro font-semibold text-sm">Rifas Participadas</p>
              </div>
              <p className="text-4xl font-black">{purchases.length}</p>
            </div>
          </div>
        </div>

        {/* Histórico de Compras */}
        <div className="bg-branco dark:bg-[#232F3E] rounded-2xl shadow-lg p-8 border border-cinza-claro dark:border-gray-700 max-w-6xl mx-auto mt-8">
          <h2 className="text-2xl font-black text-cinza-escuro dark:text-cinza-claro mb-8 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-azul-royal dark:text-azul-claro" />
            Histórico de Compras
          </h2>

          {purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Link key={purchase.id} href={`/compra/${purchase.id}`}>
                  <div className="bg-linear-to-r from-fundo-cinza to-emerald-50 dark:from-[#1a2332] dark:to-[#1a2f45] hover:from-emerald-50 hover:to-teal-50 dark:hover:from-[#1a2f45] dark:hover:to-[#1a3858] p-6 rounded-lg border border-cinza-claro dark:border-gray-700 cursor-pointer transition transform hover:scale-102 hover:border-azul-royal dark:hover:border-azul-claro">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-black text-cinza-escuro dark:text-cinza-claro text-lg mb-2">
                          {purchase.raffle?.title || 'Rifa'}
                        </p>
                        <p className="text-cinza dark:text-gray-400 text-sm flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-azul-royal dark:text-azul-claro" />
                          {purchase.livros} cota{purchase.livros !== 1 ? 's' : ''} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-azul-royal dark:text-azul-claro text-lg mb-2">
                          R$ {formatDecimal(Number(purchase.amount))}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          purchase.status === 'confirmed' 
                            ? 'bg-verde-pastel text-verde-menta dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-cinza-claro text-cinza-escuro dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {purchase.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-cinza-claro dark:text-gray-600 mx-auto mb-4" />
              <p className="text-cinza dark:text-gray-400 text-lg mb-6">Você ainda não participou de nenhuma lote</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-azul-royal dark:bg-azul-claro text-branco px-8 py-3 rounded-full font-bold hover:bg-branco dark:hover:bg-amarelo-claro border hover:text-azul-royal dark:hover:text-azul-royal transition transform hover:scale-105"
              >
                <Ticket className="w-5 h-5" />
                Explorar Lotes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
