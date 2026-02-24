import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const raffle = await queryOne(
      `SELECT 
        r.*,
        json_build_object('name', u.name, 'email', u.email) as creator,
        CASE WHEN r.winner IS NOT NULL 
          THEN (SELECT json_build_object('name', uw.name, 'email', uw.email) FROM "user" uw WHERE uw.id = r.winner)
          ELSE NULL
        END as "winnerUser"
      FROM lotes r
      LEFT JOIN "user" u ON r."creatorId" = u.id
      WHERE r.id = $1
      GROUP BY r.id, u.id`,
      [id]
    )

    if (!raffle) {
      return NextResponse.json(
        { error: 'Rifa não encontrada' },
        { status: 404 }
      )
    }

    // Buscar compras confirmadas com dados do usuário (para prêmios aleatórios)
    const purchases = await queryMany(
      `SELECT l.id, l."userId", l.numbers, l.status,
              json_build_object('name', u.name, 'email', u.email) as "user"
       FROM livros l
       LEFT JOIN "user" u ON l."userId" = u.id
       WHERE l."raffleId" = $1 AND l.status = 'confirmed' AND l."statusPago" = true`,
      [id]
    )

    return NextResponse.json({ ...raffle, purchases })
  } catch (error) {
    console.error('Error fetching raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifa' },
      { status: 500 }
    )
  }
}
