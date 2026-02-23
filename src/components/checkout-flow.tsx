'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { isAdult, isValidCPF, isValidEmail, isValidPhone } from '@/lib/validations'
import { formatCPF, formatPhone, censorName, censorPhone, formatDecimal } from '@/lib/formatters'
import { PixPaymentModal } from './pix-payment-modal'
import { Ticket, Phone, User, Mail, Calendar, Check, Tag } from 'lucide-react'

interface CupomData {
  id: string
  code: string
  discount: number
  tipoDesconto: string
  description: string | null
  loteId: string | null
  vendedor: { name: string }
}

interface CheckoutFlowProps {
  raffleId: string
  livroPrice: number
  availableLivros: number
  isOpen: boolean
  selectedQuantity: number
  cupom?: CupomData
}

type CheckoutStep = 'phone' | 'register' | 'confirm' | 'payment'

interface ExistingCustomerData {
  name: string
  phone: string
  cpf: string
}

export function CheckoutFlow({
  raffleId,
  livroPrice,
  availableLivros,
  isOpen,
  selectedQuantity,
  cupom,
}: CheckoutFlowProps) {
  const router = useRouter()
  const { user, refetch } = useAuth()

  // State for checkout flow
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingCustomer, setExistingCustomer] = useState<ExistingCustomerData | null>(null)

  // Registration form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    phoneConfirm: '',
    birthDate: '',
  })

  // Payment state
  const [showPixModal, setShowPixModal] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)

  const numericLivroPrice = Number(livroPrice)
  const originalTotal = selectedQuantity * numericLivroPrice

  // Calcular desconto do cupom
  let descontoTotal = 0
  if (cupom) {
    if (cupom.tipoDesconto === 'percentual') {
      descontoTotal = originalTotal * (cupom.discount / 100)
    } else {
      descontoTotal = Math.min(cupom.discount, originalTotal)
    }
  }
  const totalPrice = originalTotal - descontoTotal

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'cpf'
          ? formatCPF(value)
          : name === 'phone' || name === 'phoneConfirm'
          ? formatPhone(value)
          : value,
    }))
  }

  // Prevent copy/paste for sensitive fields
  const handleNoCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  // Step 1: Check for existing customer
  const handlePhoneSubmit = async () => {
    setError('')

    if (!isValidPhone(phoneInput)) {
      setError('Telefone inválido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.replace(/\D/g, '') }),
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar telefone')
      }

      const data = await response.json()

      if (data.exists) {
        // Existing customer
        setExistingCustomer(data.customer)
        setFormData({ ...formData, phone: phoneInput })
        setCurrentStep('confirm')
      } else {
        // New customer - show registration form
        setFormData({ ...formData, phone: phoneInput })
        setCurrentStep('register')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  // Validate registration form
  const validateRegistration = () => {
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
    if (formData.phone !== formData.phoneConfirm) {
      setError('Os telefones não conferem')
      return false
    }
    if (!formData.birthDate) {
      setError('Data de nascimento é obrigatória')
      return false
    }
    if (!isAdult(formData.birthDate)) {
      setError('Você deve ter no mínimo 18 anos de idade')
      return false
    }
    return true
  }

  // Step 2: Register new customer
  const handleRegisterAndContinue = async () => {
    setError('')

    if (!validateRegistration()) {
      return
    }

    setLoading(true)

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Update auth context
      await refetch()

      setCurrentStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Confirm and proceed to payment
  const handleConfirmAndProceed = async () => {
    setError('')
    setLoading(true)

    try {
      const purchaseResponse = await fetch(`/api/lotes/${raffleId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          livros: selectedQuantity,
          amount: totalPrice,
          phone: formData.phone.replace(/\D/g, ''),
          cupomId: cupom?.id || null,
          descontoAplicado: descontoTotal,
        }),
      })

      if (!purchaseResponse.ok) {
        const data = await purchaseResponse.json()
        throw new Error(data.error || 'Erro ao processar compra')
      }

      const data = await purchaseResponse.json()
      setPurchaseId(data.purchaseId)
      setShowPixModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Ticket className="w-6 h-6 text-emerald-600" />
        Compre Agora
      </h3>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Price summary */}
      <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-4 rounded-xl mb-6 border border-emerald-200">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-700">Preço por cota:</p>
          <p className="font-bold text-gray-900">R$ {formatDecimal(numericLivroPrice)}</p>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-700">Quantidade:</p>
          <p className="font-bold text-gray-900">{selectedQuantity}x</p>
        </div>
        {cupom && descontoTotal > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-700">Subtotal:</p>
              <p className="font-bold text-gray-400 line-through">R$ {formatDecimal(originalTotal)}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-blue-700 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Cupom {cupom.code}:
              </p>
              <p className="font-bold text-blue-600">- R$ {formatDecimal(descontoTotal)}</p>
            </div>
          </>
        )}
        <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
          <p className="font-black text-gray-900">Total:</p>
          <p className="text-2xl font-black text-emerald-600">R$ {formatDecimal(totalPrice)}</p>
        </div>
      </div>

      {/* Step 1: Phone Input */}
      {currentStep === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Informe seu Telefone
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900 font-semibold"
            />
            <p className="text-xs text-gray-600 mt-2">
              Se você já comprou livros conosco, vamos reconhecê-lo automaticamente
            </p>
          </div>

          <button
            onClick={handlePhoneSubmit}
            disabled={loading || !phoneInput}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '⏳ Verificando...' : '➜ Continuar'}
          </button>
        </div>
      )}

      {/* Step 2: Registration Form (New Customer) */}
      {currentStep === 'register' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="João Silva"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                onCopy={handleNoCopyPaste}
                onPaste={handleNoCopyPaste}
                placeholder="000.000.000-00"
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Não pode ser copiado</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                disabled={true}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Confirme o Telefone
            </label>
            <input
              type="tel"
              name="phoneConfirm"
              value={formData.phoneConfirm}
              onChange={handleInputChange}
              onCopy={handleNoCopyPaste}
              onPaste={handleNoCopyPaste}
              placeholder="(00) 00000-0000"
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Não pode ser copiado</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-emerald-600 focus:outline-none bg-white text-gray-900"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStep('phone')
                setError('')
              }}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50"
            >
              ← Voltar
            </button>
            <button
              onClick={handleRegisterAndContinue}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-black hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '⏳ Registrando...' : 'Continuar ➜'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation (New or Existing Customer) */}
      {currentStep === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
            <p className="text-sm font-bold text-emerald-900 mb-3">✅ Informações da Compra</p>
            <div className="space-y-2 text-sm text-gray-900">
              <p>
                <strong>Nome:</strong>{' '}
                {existingCustomer
                  ? censorName(existingCustomer.name)
                  : formData.name}
              </p>
              <p>
                <strong>Telefone:</strong> {formData.phone.slice(-4).padStart(formData.phone.length, '*')}
              </p>
              <p>
                <strong>Livros:</strong> {selectedQuantity}x
              </p>
              {cupom && descontoTotal > 0 && (
                <p className="text-blue-700">
                  <strong>Cupom:</strong> {cupom.code} (-R$ {formatDecimal(descontoTotal)})
                </p>
              )}
              <p className="border-t border-emerald-200 pt-2">
                <strong>Total:</strong> <span className="text-lg font-black text-emerald-700">R$ {formatDecimal(totalPrice)}</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            Ao clicar em "Concluir Reserva", você será direcionado para o pagamento via PIX.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStep('phone')
                setError('')
              }}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50"
            >
              ← Voltar
            </button>
            <button
              onClick={handleConfirmAndProceed}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-black hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '⏳ Processando...' : 'Concluir Reserva ➜'}
            </button>
          </div>
        </div>
      )}

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
          
          // Redirecionar automaticamente para Meus Bilhetes
          if (purchaseId) {
            // Se é compra anônima, salva dados para não precisar preencher novamente
            if (!user) {
              localStorage.setItem('ticketQuery', JSON.stringify({
                phone: formData.phone.replace(/\D/g, ''),
                cpf: formData.cpf.replace(/\D/g, ''),
              }))
            }
            
            // Redirecionar para visualizar bilhetes confirmados
            router.push('/meus-bilhetes/resultado')
          }
        }}
      />
    </div>
  )
}
