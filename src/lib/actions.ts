import { query, queryOne } from '@/lib/db'
import { CreateRaffleInput, CreateUserInput } from '@/lib/validations'

export async function createUser(data: CreateUserInput) {
  const { email, name, cpf, phone } = data
  const queryStr = `
    INSERT INTO "user" (id, email, name, cpf, phone, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
    RETURNING *
  `
  return queryOne(queryStr, [email, name, cpf, phone])
}

export async function createRaffle(
  creatorId: string,
  data: CreateRaffleInput
) {
  const { title, description, prizeAmount, totalLivros, livroPrice, images } = data
  const queryStr = `
    INSERT INTO lotes (
      id, title, description, "prizeAmount", "totalLivros", "livroPrice",
      "creatorId", status, image, images, "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5,
      $6, 'open', $7, $8, NOW(), NOW()
    )
    RETURNING *
  `
  const imageArray = images || []
  const firstImage = imageArray[0] || null

  return queryOne(queryStr, [
    title,
    description,
    prizeAmount,
    totalLivros,
    livroPrice,
    creatorId,
    firstImage,
    JSON.stringify(imageArray),
  ])
}

export async function purchaseQuotas(
  userId: string,
  raffleId: string,
  quotas: number,
  amount: number
) {
  // Buscar o lote
  const lote = await queryOne(
    'SELECT * FROM lotes WHERE id = $1',
    [raffleId]
  )

  if (!lote) throw new Error('Lote não encontrado')
  if (lote.status !== 'open') {
    throw new Error('Este lote não está aberto para compras')
  }
  if (lote.soldLivros + quotas > lote.totalLivros) {
    throw new Error('Livros insuficientes')
  }

  // Gerar números aleatórios (6 dígitos: 000000-999999)
  const numbers = Array.from(
    { length: quotas },
    () => {
      const randomNum = Math.floor(Math.random() * 1000000)
      return String(randomNum).padStart(6, '0')
    }
  )

  // Criar compra
  const purchaseQuery = `
    INSERT INTO livros (
      id, "userId", "raffleId", livros, amount, numbers, status, "createdAt", "updatedAt"
    )
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'completed', NOW(), NOW())
    RETURNING *
  `

  const purchase = await queryOne(purchaseQuery, [
    userId,
    raffleId,
    quotas,
    amount,
    JSON.stringify(numbers),
  ])

  // Atualizar livros vendidos no lote
  await query('UPDATE lotes SET "soldLivros" = "soldLivros" + $1 WHERE id = $2', [
    quotas,
    raffleId,
  ])

  // Atualizar top buyer
  await updateTopBuyer(userId, amount, quotas)

  return purchase
}

export async function updateTopBuyer(
  userId: string,
  amount: number,
  quotas: number
) {
  const existing = await queryOne(
    'SELECT * FROM "topBuyer" WHERE "userId" = $1',
    [userId]
  )

  if (existing) {
    return queryOne(
      `
      UPDATE "topBuyer"
      SET "totalSpent" = "totalSpent" + $1, "totalLivros" = "totalLivros" + $2, "updatedAt" = NOW()
      WHERE "userId" = $3
      RETURNING *
      `,
      [amount, quotas, userId]
    )
  }

  return queryOne(
    `
    INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalQuotas", "raffleBought", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())
    RETURNING *
    `,
    [userId, amount, quotas]
  )
}
