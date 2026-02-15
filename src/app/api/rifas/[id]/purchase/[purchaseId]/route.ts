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
      'SELECT * FROM livros WHERE id = $1 AND "raffleId" = $2',
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
      'SELECT * FROM livros WHERE id = $1 AND "raffleId" = $2',
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

    // Deletar a compra pendente
    // OBS: Compras pendentes NÃO incrementam soldLivros nem topBuyer,
    // então não precisamos reverter nada - apenas deletar
    await queryOne(
      'DELETE FROM livros WHERE id = $1',
      [purchaseId]
    )

    console.log('[Purchase] Compra pendente cancelada/expirada:', {
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
