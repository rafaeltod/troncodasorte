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
  prizeAmount: z.number().positive('Valor do prêmio deve ser positivo'),
  totalQuotas: z.number().int().positive('Número de cotas deve ser positivo'),
  quotaPrice: z.number().positive('Preço da cota deve ser positivo').default(0.50),
  images: z.array(z.string()).max(20, 'Máximo 20 imagens').optional(),
})

export const purchaseRaffleSchema = z.object({
  raffleId: z.string(),
  quotas: z.number().int().positive('Número de cotas deve ser positivo'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateRaffleInput = z.infer<typeof createRaffleSchema>
export type PurchaseRaffleInput = z.infer<typeof purchaseRaffleSchema>
