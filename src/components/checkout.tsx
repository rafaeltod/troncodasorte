'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { isAdult, isValidCPF, isValidEmail, isValidPhone } from '@/lib/validations'
import { formatCPF, formatPhone, censorName, censorPhone } from '@/lib/formatters'
import { PixPaymentModal } from './pix-payment-modal'
import { Ticket, Minus, Plus, User, Mail, FileText, Phone, Calendar } from 'lucide-react'

interface CheckoutProps {
  raffleId: string
  quotaPrice: number
  availableQuotas: number
  isOpen: boolean
}

export function Checkout({
  raffleId,
  quotaPrice,
  availableQuotas,
  isOpen,
}: CheckoutProps) {
  const router = useRouter()
  const { user, refetch } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dados para novo cadastro (se não estiver logado)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
  })

  const [showPixModal, setShowPixModal] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const numericQuotaPrice = Number(quotaPrice)
  const totalPrice = quantity * numericQuotaPrice

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= availableQuotas) {
      setQuantity(newQuantity)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cpf' ? formatCPF(value) : name === 'phone' ? formatPhone(value) : value,
    }))
  }

  const validateForm = () => {
    if (!user) {
      if (!formData.name.trim()) {
        setError('Nome é obrigatório')
        return false
      }
      if (!isValidEmail(formData.email)) {
        setError('Email válido é obrigatório')
        return false
      }
      if (!isValidCPF(formData.cpf)) {
        setError('CPF inválido')
        return false
      }
      if (!isValidPhone(formData.phone)) {
        setError('Telefone inválido')
        return false
      }
      if (!formData.birthDate) {
        setError('Data de nascimento é obrigatória')
        return false
      }

      // Validar idade mínima de 18 anos
      if (!isAdult(formData.birthDate)) {
        setError('Você deve ter no mínimo 18 anos de idade')
        return false
      }
    }
    return true
  }

  const handlePayment = async () => {
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    // ✅ Se o modal já estiver aberto, fechar primeiro para resetar
    if (showPixModal) {
      setShowPixModal(false)
      setPurchaseId(null)
      // Pequeno delay para garantir que o modal fecha completamente
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    try {
      // Se não estiver logado, criar conta primeiro
      if (!user) {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf.replace(/\D/g, ''),
            phone: formData.phone.replace(/\D/g, ''),
            birthDate: formData.birthDate,
            acceptedTerms: true,
          }),
        })

        if (!registerResponse.ok) {
          const data = await registerResponse.json()
          throw new Error(data.error || 'Erro ao criar conta')
        }

        // Atualizar context de autenticação com novo usuário
        await refetch()
      }

      // Fazer a compra
      const purchaseResponse = await fetch(`/api/campanhas/${raffleId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quotas: quantity,
          amount: totalPrice,
        }),
      })

      if (!purchaseResponse.ok) {
        const data = await purchaseResponse.json()
        throw new Error(data.error || 'Erro ao processar compra')
      }

      const data = await purchaseResponse.json()

      // Mostrar modal de pagamento PIX
      setPurchaseId(data.purchaseId)
      setShowPixModal(true)
    } catch (err) {
      console.error('[Checkout] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-20">
      <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Ticket className="w-6 h-6 text-emerald-600" />
        Compre Agora
      </h3>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <>
        {/* Mostrar dados do usuário se logado */}
          {user && (
            <div className="mb-6 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900">✅ Logado como:</p>
              <p className="text-emerald-800 font-semibold">{censorName(user.name)}</p>
            </div>
          )}

          {/* Formulário de cadastro para novo usuário */}
          {!user && (
            <div className="mb-6 space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Primeira Compra - Informações Rápidas
              </h4>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Seleção de quantidade */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Quantidade de Cotas</label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-200 mb-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || loading}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <input
                type="number"
                min="1"
                max={availableQuotas}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                disabled={loading}
                className="flex-1 text-center text-2xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableQuotas || loading}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">{availableQuotas} cotas disponíveis</p>
          </div>

          {/* Resumo de preço */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl mb-6 border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-700">Preço por cota:</p>
              <p className="font-bold text-gray-900">R$ {numericQuotaPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-700">Quantidade:</p>
              <p className="font-bold text-gray-900">{quantity}x</p>
            </div>
            <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
              <p className="font-black text-gray-900">Total:</p>
              <p className="text-2xl font-black text-emerald-600">R$ {totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Botão de compra */}
          <button
            onClick={handlePayment}
            disabled={loading || quantity === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '⏳ Processando...' : `💳 Comprar Agora - R$ ${totalPrice.toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-600 text-center mt-3">
            ✅ Pagamento seguro via PIX
          </p>
      </>


      {/* PIX Payment Modal */}
      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false)
          setPurchaseId(null)
        }}
        purchaseId={purchaseId || ''}
        amount={totalPrice}
        raffleId={raffleId}
        onPaymentConfirmed={() => {
          setShowPixModal(false)
          setPurchaseId(null)
          router.push('/historico')
        }}
        onCanceled={() => {
          setShowPixModal(false)
          setPurchaseId(null)
          setQuantity(1)
        }}
      />
    </div>
  )
}
