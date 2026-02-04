import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export async function GET() {
  try {
    const topBuyers = await queryMany(
      `SELECT * FROM "topBuyer" ORDER BY "totalSpent" DESC LIMIT 5`
    )

    return NextResponse.json(topBuyers)
  } catch (error) {
    console.error('Error fetching top buyers:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar top compradores' },
      { status: 500 }
    )
  }
}
