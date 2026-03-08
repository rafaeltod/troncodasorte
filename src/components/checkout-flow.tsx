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
  progressiveDiscountPct?: number
  cliente?: string
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
  progressiveDiscountPct = 0,
  cliente,
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

  // Termos e condições
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Upsell
  const [selectedExtras, setSelectedExtras] = useState<number[]>([])
  const upsellPresets = [10, 50, 100, 200]
  const availableForExtra = availableLivros - selectedQuantity
  const extraQuantity = selectedExtras.reduce((a, b) => a + b, 0)

  const numericLivroPrice = Number(livroPrice)
  const totalQuantity = selectedQuantity + extraQuantity
  const originalTotal = Math.round(totalQuantity * numericLivroPrice * 100) / 100

  // Desconto progressivo
  const progressiveDiscountAmount = Math.round(originalTotal * (progressiveDiscountPct / 100) * 100) / 100
  // Calcular desconto do cupom
  let descontoTotal = progressiveDiscountAmount
  if (cupom) {
    const baseAfterProgressive = originalTotal - progressiveDiscountAmount
    if (cupom.tipoDesconto === 'percentual') {
      descontoTotal += Math.round(baseAfterProgressive * (cupom.discount / 100) * 100) / 100
    } else {
      descontoTotal += Math.min(cupom.discount, baseAfterProgressive)
    }
    descontoTotal = Math.round(descontoTotal * 100) / 100
  }
  const totalPrice = Math.round((originalTotal - descontoTotal) * 100) / 100

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
        // Existing customer - sem login, apenas guarda dados para redirecionar depois
        setExistingCustomer(data.customer)
        setFormData({ ...formData, phone: phoneInput, cpf: data.customer.cpf || '' })
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

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade')
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

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade')
      return
    }

    setLoading(true)

    try {
      const purchaseResponse = await fetch(`/api/lotes/${raffleId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          livros: totalQuantity,
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
    <div className="bg-branco rounded-2xl ">
      {error && (
        <div className="mb-6 bg-red-50 text-vermelho-vivo p-4 rounded-lg">
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Price summary — hidden on confirm step (replaced by upsell panel) */}
      {currentStep !== 'confirm' && (
        <div className="rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-cinza">Preço por cota:</p>
            <p className="font-bold text-cinza-escuro">R$ {formatDecimal(numericLivroPrice)}</p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-cinza-escuro">Quantidade:</p>
            <p className="font-bold text-cinza">{selectedQuantity}x</p>
          </div>
          {descontoTotal > 0 && (
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-cinza-escuro">Subtotal:</p>
              <p className="font-bold text-cinza line-through">R$ {formatDecimal(originalTotal)}</p>
            </div>
          )}
          {progressiveDiscountPct > 0 && (
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-verde-agua font-semibold">Desconto progressivo ({progressiveDiscountPct}%):</p>
              <p className="font-bold text-verde-agua">-R$ {formatDecimal(progressiveDiscountAmount)}</p>
            </div>
          )}
          {cupom && descontoTotal > progressiveDiscountAmount && (
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-azul-royal font-semibold">Cupom {cupom.code}:</p>
              <p className="font-bold text-azul-royal">-R$ {formatDecimal(descontoTotal - progressiveDiscountAmount)}</p>
            </div>
          )}
          <div className="pt-2 border-t border-cinza-claro flex justify-between items-center">
            <p className="text-cinza-escuro">Total:</p>
            <p className="text-2xl font-black text-azul-royal">R$ {formatDecimal(totalPrice)}</p>
          </div>
        </div>
      )}

      {/* Step 1: Phone Input */}
      {currentStep === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-cinza-escuro mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Informe seu Telefone
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-azul-royal focus:outline-none bg-branco text-cinza font-semibold"
            />
            <p className="text-xs text-cinza mt-2">
              Se você já comprou livros conosco, vamos reconhecê-lo automaticamente
            </p>
          </div>

          <button
            onClick={handlePhoneSubmit}
            disabled={loading || !phoneInput}
            className="w-full bg-azul-royal text-branco py-4 rounded-full font-black text-lg hover:bg-branco hover:text-azul-royal hover:border-2 hover:border-azul-royal cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </div>
      )}

      {/* Step 2: Registration Form (New Customer) */}
      {currentStep === 'register' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-cinza-escuro mb-2">
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
              className="w-full px-4 py-3 rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-branco text-cinza-escuro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cinza-escuro mb-2">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                onCopy={handleNoCopyPaste}
                onPaste={handleNoCopyPaste}
                placeholder="000.000.000-00"
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-branco text-cinza-escuro"
              />
              <p className="text-xs text-cinza mt-1">Não pode ser copiado</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-cinza-escuro mb-2">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                disabled={true}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-cinza-claro bg-cinza-claro text-cinza-escuro cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cinza-escuro mb-2">
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
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-branco text-cinza-escuro"
            />
            <p className="text-xs text-cinza mt-1">Não pode ser copiado</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-cinza-escuro mb-2">
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
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-branco text-cinza-escuro"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cinza-escuro mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-cinza-claro focus:border-azul-royal focus:outline-none bg-branco text-cinza-escuro"
            />
          </div>

          {/* Checkbox de Termos no Registro */}
          <div className="bg-azul-pastel/20 border border-azul-royal/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-azul-royal text-azul-royal focus:ring-azul-royal cursor-pointer"
              />
              <span className="text-sm text-cinza-escuro">
                Li e aceito os{' '}
                <a
                  href={cliente ? `/${cliente}/termos` : '/termos'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-azul-royal font-bold hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Termos de Uso
                </a>
                {' '}e a{' '}
                <a
                  href={cliente ? `/${cliente}/privacidade` : '/privacidade'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-azul-royal font-bold hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidade
                </a>
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStep('phone')
                setError('')
              }}
              disabled={loading}
              className="flex-1 bg-cinza-claro text-cinza-escuro py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleRegisterAndContinue}
              disabled={loading || !acceptedTerms}
              className="flex-1 bg-azul-royal text-branco py-3 rounded-lg font-black hover:bg-azul-royal/80 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Registrando...' : 'Continuar'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation (New or Existing Customer) */}
      {currentStep === 'confirm' && (
        <div className="space-y-4">

          {/* Upsell panel */}
          <div className=" rounded-xl">
            <p className="text-2xl font-black text-cinza mb-5">Aumente suas chances!</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {upsellPresets
                .filter(q => selectedExtras.includes(q) || (extraQuantity + q) <= availableForExtra)
                .map(q => {
                  const price = q * numericLivroPrice
                  const selected = selectedExtras.includes(q)
                  return (
                    <button
                      key={q}
                      onClick={() => setSelectedExtras(prev => selected ? prev.filter(x => x !== q) : [...prev, q])}
                      className={`rounded-xl py-2 text-2xl font-bold cursor-pointer border-2 transition ${
                        selected
                          ? 'bg-azul-royal text-branco border-azul-royal'
                          : 'bg-azul-claro text-branco hover:bg-azul-royal hover:text-branco'
                      }`}
                    >
                      +{q} livros<br />
                      <span className="text-[19px] -mt-1.25 font-semibold">R$ {formatDecimal(price)}</span>
                    </button>
                  )
                })}
            </div>
            <div className="border-t border-amarelo-gold/30 pt-3 flex justify-between items-center">
              <p className="text-1xl text-cinza-escuro">
                Total ({totalQuantity}x livro{totalQuantity > 1 ? 's' : ''}):
              </p>
              <p className="text-xl font-black text-azul-royal">R$ {formatDecimal(totalPrice)}</p>
            </div>
          </div>

          <div className=" rounded-lg">
            <p className="text-2xl font-bold text-cinza-escuro mb-3">Informações da Compra</p>
            <div className="space-y-2 text-1xl text-cinza-escuro">
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
                <strong>Livros:</strong> {totalQuantity}x
              </p>
              <p className="border-t border-azul-pastel pt-2">
                {descontoTotal > 0 && (
                  <span className="block text-cinza line-through text-sm">R$ {formatDecimal(originalTotal)}</span>
                )}
                <strong>Total:</strong> <span className="text-[22px] font-black text-azul-royal">R$ {formatDecimal(totalPrice)}</span>
                {progressiveDiscountPct > 0 && (
                  <span className="block text-xs text-verde-agua font-semibold mt-0.5">Desconto progressivo -{progressiveDiscountPct}% aplicado</span>
                )}
              </p>
            </div>
          </div>

          <p className="text-1xl text-cinza">
            Ao clicar em "Concluir Reserva", você será direcionado para o pagamento via PIX.
          </p>

          {/* Checkbox de Termos */}
          <div className="bg-azul-pastel/20 border border-azul-royal/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-azul-royal text-azul-royal focus:ring-azul-royal cursor-pointer"
              />
              <span className="text-sm text-cinza-escuro">
                Li e aceito os{' '}
                <a
                  href={cliente ? `/${cliente}/termos` : '/termos'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-azul-royal font-bold hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Termos de Uso
                </a>
                {' '}e a{' '}
                <a
                  href={cliente ? `/${cliente}/privacidade` : '/privacidade'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-azul-royal font-bold hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidade
                </a>
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStep('phone')
                setError('')
              }}
              disabled={loading}
              className="flex-1 text-cinza bg-cinza-claro hover:bg-cinza hover:text-branco cursor-pointer py-3 rounded-full font-bold transition disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmAndProceed}
              disabled={loading || !acceptedTerms}
              className="flex-1 bg-azul-royal hover:bg-branco hover:text-azul-royal hover:border-2 hover:border-azul-royal cursor-pointer text-branco py-3 rounded-full font-black transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Processando...' : 'Concluir Reserva'}
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
          
          // Sempre salvar phone+cpf para consulta de bilhetes (sem login)
          if (purchaseId) {
            const phoneValue = formData.phone.replace(/\D/g, '')
            const cpfValue = (formData.cpf || existingCustomer?.cpf || '').replace(/\D/g, '')
            localStorage.setItem('ticketQuery', JSON.stringify({
              phone: phoneValue,
              cpf: cpfValue,
            }))
            
            // Redirecionar para visualizar bilhetes confirmados
            router.push(cliente ? `/${cliente}/meus-bilhetes/resultado` : '/meus-bilhetes/resultado')
          }
        }}
      />
    </div>
  )
}
