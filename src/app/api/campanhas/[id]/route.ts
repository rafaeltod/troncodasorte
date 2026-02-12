import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const raffle = await queryOne(
      `SELECT 
        r.*,
        json_build_object('name', u.name, 'email', u.email) as creator
      FROM raffle r
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

    return NextResponse.json(raffle)
  } catch (error) {
    console.error('Error fetching raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifa' },
      { status: 500 }
    )
  }
}
