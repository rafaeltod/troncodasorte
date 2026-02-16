import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

interface RouteProps {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params

    const raffle = await queryOne(
      `SELECT id, title, status FROM lotes WHERE id = $1`,
      [id]
    )

    if (!raffle) {
      return NextResponse.json(
        { error: 'Lote não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lote' },
      { status: 500 }
    )
  }
}
