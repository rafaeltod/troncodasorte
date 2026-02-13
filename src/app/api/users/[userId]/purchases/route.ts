import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const purchases = await queryMany(
      `SELECT 
        rp.id,
        rp."raffleId",
        rp.quotas,
        rp.amount,
        rp.status,
        rp.numbers,
        rp."createdAt",
        r.title as "raffleTitle",
        r.status as "raffleStatus",
        r.winner
       FROM "rafflePurchase" rp
       JOIN raffle r ON rp."raffleId" = r.id
       WHERE rp."userId" = $1
       ORDER BY rp."createdAt" DESC`,
      [userId]
    )

    // Mapear para o formato esperado pelo frontend
    const formattedPurchases = purchases.map(p => ({
      id: p.id,
      raffleId: p.raffleId,
      raffle: {
        title: p.raffleTitle,
        status: p.raffleStatus,
        winner: p.winner
      },
      quotas: p.quotas,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt
    }))

    return NextResponse.json(formattedPurchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar compras' },
      { status: 500 }
    )
  }
}
