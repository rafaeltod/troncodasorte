import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export async function GET() {
  try {
    const topBuyers = await queryMany(
      `SELECT 
        tb.id,
        tb."userId",
        u.name,
        u.email,
        tb."totalSpent",
        tb."totalLivros",
        tb."raffleBought"
       FROM "topBuyer" tb
       JOIN "user" u ON tb."userId" = u.id
       ORDER BY tb."totalSpent" DESC
       LIMIT 5`
    )

    // Converter strings em números (DECIMAL do PostgreSQL retorna como string)
    const formatted = topBuyers.map(buyer => ({
      ...buyer,
      totalSpent: Number(buyer.totalSpent) || 0,
      totalLivros: Number(buyer.totalLivros) || 0,
      raffleBought: Number(buyer.raffleBought) || 0,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching top buyers:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar top compradores' },
      { status: 500 }
    )
  }
}
