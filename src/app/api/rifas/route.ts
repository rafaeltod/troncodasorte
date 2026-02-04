import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany, query } from '@/lib/db'
import { createRaffleSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate
    const validatedData = createRaffleSchema.parse(body)

    // TODO: Get userId from session/auth
    const userId = body.creatorId || 'default-user'

    // Check if user exists, if not create it
    let user = await queryOne(
      'SELECT * FROM "user" WHERE id = $1',
      [userId]
    )

    if (!user) {
      user = await queryOne(
        `INSERT INTO "user" (id, cpf, name, email, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [userId, body.cpf || '000.000.000-00', body.name || 'Criador', body.email || `user-${userId}@tronco.com`]
      )
    }

    // Create raffle
    const raffle = await queryOne(
      `INSERT INTO raffle (title, description, "prizeAmount", "totalQuotas", "quotaPrice", "creatorId", status, image, images, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.prizeAmount,
        validatedData.totalQuotas,
        validatedData.quotaPrice,
        user.id,
        validatedData.images?.[0] || null,
        JSON.stringify(validatedData.images || []),
      ]
    )

    return NextResponse.json(raffle, { status: 201 })
  } catch (error) {
    console.error('Error creating raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao criar rifa' },
      { status: 400 }
    )
  }
}

export async function GET() {
  try {
    const raffles = await queryMany(
      `SELECT r.*, json_build_object('name', u.name, 'email', u.email) as creator
       FROM raffle r
       JOIN "user" u ON r."creatorId" = u.id
       ORDER BY r."createdAt" DESC`
    )

    return NextResponse.json(raffles)
  } catch (error) {
    console.error('Error fetching raffles:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifas' },
      { status: 500 }
    )
  }
}
