import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

/**
 * GET /api/purchases/[purchaseId]
 * 
 * Busca uma compra pelo ID, permitindo acesso a compras anônimas quando
 * a compra foi acabada de ser feita (redirect do checkout)
 * 
 * Retorna: { id, raffleId, livros, amount, status, numbers, userId, createdAt, raffle }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const { purchaseId } = await params

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'purchaseId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a compra diretamente (sem filtrar por userId)
    // Isso permite visualizar compras anônimas logo após serem criadas
    const purchase = await queryOne(
      `SELECT 
        l.id,
        l."raffleId",
        l.livros,
        l.amount,
        l.status,
        l.numbers,
        l."userId",
        l."createdAt",
        r.title as "raffle_title",
        r.status as "raffle_status",
        r.winner,
        r."prizeAmount"
      FROM livros l
      LEFT JOIN lotes r ON l."raffleId" = r.id
      WHERE l.id = $1`,
      [purchaseId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Formatar resposta
    const response = {
      id: purchase.id,
      raffleId: purchase.raffleId,
      livros: purchase.livros,
      amount: purchase.amount,
      status: purchase.status,
      numbers: purchase.numbers ? purchase.numbers.split(',').filter(Boolean) : [],
      userId: purchase.userId,
      createdAt: purchase.createdAt,
      raffle: {
        title: purchase.raffle_title,
        status: purchase.raffle_status,
        winner: purchase.winner,
        prizeAmount: purchase.prizeAmount,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/purchases/:purchaseId] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar compra' },
      { status: 500 }
    )
  }
}
