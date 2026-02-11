import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { phone, cpf } = await req.json()

    if (!phone || !cpf) {
      return NextResponse.json(
        { error: 'Telefone e CPF são obrigatórios' },
        { status: 400 }
      )
    }

    // Find user by phone and CPF
    const user = await queryOne(
      'SELECT id, name, email, cpf, phone FROM "user" WHERE phone = $1 AND cpf = $2',
      [phone, cpf]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Nenhuma compra encontrada com esses dados' },
        { status: 404 }
      )
    }

    // Get user's purchases
    const purchases = await queryMany(
      `SELECT 
        rp.id,
        rp.quotas,
        rp.amount,
        rp.status,
        rp."createdAt",
        r.title as "raffleTitle",
        r.status as "raffleStatus"
      FROM "rafflePurchase" rp
      JOIN raffle r ON rp."raffleId" = r.id
      WHERE rp."userId" = $1
      ORDER BY rp."createdAt" DESC`,
      [user.id]
    )

    return NextResponse.json({
      user: {
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
      },
      purchases,
    })
  } catch (error) {
    console.error('[Check Tickets] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar bilhetes' },
      { status: 500 }
    )
  }
}
