import { z } from 'zod'

export const createUserSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

export const createRaffleSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  prizeAmount: z.number().min(0, 'Valor do prêmio não pode ser negativo').optional().default(0),
  totalLivros: z.number().int().positive('Número de livros deve ser positivo'),
  livroPrice: z.number().positive('Preço do livro deve ser positivo').default(0.50),
  images: z.array(z.string()).max(20, 'Máximo 20 imagens').optional(),
  qtdPremiosAleatorios: z.number().int().min(0, 'Quantidade não pode ser negativa').optional().default(0),
  premiosConfig: z.array(z.object({
    tipo: z.enum(['dinheiro', 'item']),
    descricao: z.string().optional().default(''),
    valor: z.string().optional().default(''),
  })).optional(),
})

export const purchaseRaffleSchema = z.object({
  raffleId: z.string(),
  livros: z.number().int().positive('Número de livros deve ser positivo'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateRaffleInput = z.infer<typeof createRaffleSchema>
export type PurchaseRaffleInput = z.infer<typeof purchaseRaffleSchema>

export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDifference = today.getMonth() - birth.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function isAdult(birthDate: string | Date): boolean {
  return calculateAge(birthDate) >= 18
}

// Validações de campo
export function isValidCPF(cpf: string): boolean {
  const cleanedCPF = cpf.replace(/\D/g, '')
  return cleanedCPF.length === 11
}

export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.')
}

export function isValidPhone(phone: string): boolean {
  const cleanedPhone = phone.replace(/\D/g, '')
  return cleanedPhone.length >= 10
}

