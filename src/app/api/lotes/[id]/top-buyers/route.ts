import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

interface RouteProps {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id: raffleId } = await params

    // Buscar top compradores de um lote específico
    const topBuyers = await queryMany(
      `SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT l.id) as "raffleBought",
        SUM(l.livros) as "totalLivros",
        SUM(l.amount) as "totalSpent"
       FROM livros l
       JOIN "user" u ON l."userId" = u.id
       WHERE l."raffleId" = $1 AND l.status = 'confirmed'
       GROUP BY u.id, u.name, u.email
       ORDER BY "totalSpent" DESC
       LIMIT 5`,
      [raffleId]
    )

    // Converter strings em números (DECIMAL do PostgreSQL retorna como string)
    const formatted = topBuyers.map(buyer => ({
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      totalSpent: Number(buyer.totalSpent) || 0,
      totalLivros: Number(buyer.totalLivros) || 0,
      raffleBought: Number(buyer.raffleBought) || 0,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching raffle top buyers:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar top compradores' },
      { status: 500 }
    )
  }
}
