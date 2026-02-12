import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

interface ConfirmPaymentRequest {
  purchaseId: string
  raffleId: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await req.json()
    const { purchaseId, raffleId } = body

    if (!purchaseId || !raffleId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

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

    // Se já confirmada, retornar OK
    if (purchase.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        message: 'Pagamento já confirmado',
        status: 'confirmed',
      })
    }

    // Confirmar pagamento
    const updated = await queryOne(
      'UPDATE "rafflePurchase" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['confirmed', purchaseId]
    )

    console.log('[Payment Confirm] ✅ Pagamento confirmado:', {
      purchaseId,
      raffleId,
      status: updated.status,
    })

    return NextResponse.json({
      success: true,
      message: 'Pagamento confirmado com sucesso!',
      status: 'confirmed',
    })
  } catch (error) {
    console.error('[Payment Confirm] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    )
  }
}
