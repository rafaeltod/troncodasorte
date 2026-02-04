import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const purchases = await queryMany(
      `SELECT rp.*, r.title as "raffleTitle", r."prizeAmount"
       FROM "rafflePurchase" rp
       JOIN raffle r ON rp."raffleId" = r.id
       WHERE rp."userId" = $1
       ORDER BY rp."createdAt" DESC`,
      [userId]
    )

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar compras' },
      { status: 500 }
    )
  }
}
