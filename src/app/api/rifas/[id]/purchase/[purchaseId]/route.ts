import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

interface RouteProps {
  params: Promise<{
    id: string
    purchaseId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id: raffleId, purchaseId } = await params

    // Token opcional - usuários podem verificar compra sem estar logados
    const token = req.cookies.get('token')?.value

    // Buscar a compra
    const purchase = await queryOne(
      'SELECT * FROM "rafflePurchase" WHERE id = $1 AND "raffleId" = $2',
      [purchaseId, raffleId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Não exigir autenticação para acessar status da compra
    // Qualquer um pode verificar o status conhecendo o ID da compra
    return NextResponse.json({
      purchaseId: purchase.id,
      status: purchase.status,
      livros: purchase.livros,
      amount: purchase.amount,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    })
  } catch (error) {
    console.error('Error getting purchase status:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status da compra' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id: raffleId, purchaseId } = await params
    
    // Token opcional - usuários podem cancelar sem estar logados
    const token = req.cookies.get('token')?.value

    // Buscar a compra
    const purchase = await queryOne(
      'SELECT * FROM "rafflePurchase" WHERE id = $1 AND "raffleId" = $2',
      [purchaseId, raffleId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a compra já foi confirmada (não pode cancelar pagamentos confirmados)
    if (purchase.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Não é possível cancelar uma compra já confirmada' },
        { status: 400 }
      )
    }

    const livrosToCancel = Number(purchase.livros)
    const amountToCancel = Number(purchase.amount)

    // Deletar a compra
    await queryOne(
      'DELETE FROM "rafflePurchase" WHERE id = $1',
      [purchaseId]
    )

    // Reverter quantidades vendidas da rifa
    await queryOne(
      `UPDATE raffle 
       SET "soldLivros" = "soldLivros" - $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [livrosToCancel, raffleId]
    )

    // Atualizar top buyer (subtrair cotas e valor gasto)
    const topBuyer = await queryOne(
      `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
      [token]
    )

    if (topBuyer) {
      const newTotalSpent = Math.max(0, Number(topBuyer.totalSpent) - amountToCancel)
      const newTotalLivros = Math.max(0, Number(topBuyer.totalLivros) - livrosToCancel)
      const newRaffleBought = Math.max(0, Number(topBuyer.raffleBought) - 1)

      if (newTotalSpent === 0 && newTotalLivros === 0 && newRaffleBought === 0) {
        // Deletar o top buyer se não tiver mais compras
        await queryOne(
          `DELETE FROM "topBuyer" WHERE "userId" = $1`,
          [token]
        )
      } else {
        // Atualizar o top buyer
        await queryOne(
          `UPDATE "topBuyer" 
           SET "totalSpent" = $1,
               "totalLivros" = $2,
               "raffleBought" = $3,
               "updatedAt" = NOW()
           WHERE "userId" = $4`,
          [newTotalSpent, newTotalLivros, newRaffleBought, token]
        )
      }
    }

    console.log('[Purchase] Compra cancelada:', {
      purchaseId,
      raffleId,
      livrosCanceled: livrosToCancel,
      amountCanceled: amountToCancel,
    })

    return NextResponse.json({
      message: 'Compra cancelada com sucesso',
      purchaseId,
    })
  } catch (error) {
    console.error('Error canceling purchase:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar compra' },
      { status: 500 }
    )
  }
}
