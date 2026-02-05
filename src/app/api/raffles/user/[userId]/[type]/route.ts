import { NextRequest, NextResponse } from 'next/server'
import {
  getUserCreatedRaffles,
  getUserParticipatingRaffles,
  getUserFinishedRaffles,
  getAvailableRaffles,
} from '@/lib/queries'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; type: string }> }
) {
  try {
    const { userId, type } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    let raffles = []

    switch (type) {
      case 'created':
        raffles = await getUserCreatedRaffles(userId)
        break
      case 'participating':
        raffles = await getUserParticipatingRaffles(userId)
        break
      case 'finished':
        raffles = await getUserFinishedRaffles(userId)
        break
      case 'available':
        raffles = await getAvailableRaffles(userId)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de rifa inválido' },
          { status: 400 }
        )
    }

    // Converter valores numéricos para número (PostgreSQL retorna como string)
    const formattedRaffles = raffles?.map((r: any) => ({
      ...r,
      prizeAmount: Number(r.prizeAmount),
      quotaPrice: Number(r.quotaPrice),
      totalQuotas: Number(r.totalQuotas),
      soldQuotas: Number(r.soldQuotas),
    })) || []

    return NextResponse.json(formattedRaffles)
  } catch (error) {
    console.error('Error fetching raffles:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifas' },
      { status: 500 }
    )
  }
}
