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

    // Procura por usuário com phone e CPF
    const user = await queryOne(
      'SELECT id, name, email, cpf, phone FROM "user" WHERE phone = $1 AND cpf = $2',
      [phone, cpf]
    )

    let purchases = []

    if (user) {
      // Se achou usuário, busca compras associadas ao userId
      purchases = await queryMany(
        `SELECT 
          rp.id,
          rp."raffleId",
          rp.livros,
          rp.amount,
          rp.status,
          rp.numbers,
          rp."createdAt",
          r.title as "raffleTitle",
          r.status as "raffleStatus"
        FROM livros rp
        JOIN raffle r ON rp."raffleId" = r.id
        WHERE rp."userId" = $1
        ORDER BY rp."createdAt" DESC`,
        [user.id]
      )

      // Mapear números como array
      purchases = purchases.map(p => ({
        ...p,
        numbers: p.numbers ? p.numbers.split(',') : []
      }))

      return NextResponse.json({
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
        },
        purchases,
      })
    }

    // Se não achou usuário, procura por compras anônimas com esse telefone
    purchases = await queryMany(
      `SELECT 
        rp.id,
        rp."raffleId",
        rp.livros,
        rp.amount,
        rp.status,
        rp.numbers,
        rp."createdAt",
        r.title as "raffleTitle",
        r.status as "raffleStatus"
      FROM livros rp
      JOIN raffle r ON rp."raffleId" = r.id
      WHERE rp.phone = $1 AND rp."userId" IS NULL
      ORDER BY rp."createdAt" DESC`,
      [phone]
    )

    // Mapear números como array
    purchases = purchases.map(p => ({
      ...p,
      numbers: p.numbers ? p.numbers.split(',') : []
    }))

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma compra encontrada com esses dados' },
        { status: 404 }
      )
    }

    // Para compras anônimas, não temos dados do usuário
    return NextResponse.json({
      user: {
        name: 'Comprador Anônimo',
        phone: phone,
        cpf: cpf,
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
