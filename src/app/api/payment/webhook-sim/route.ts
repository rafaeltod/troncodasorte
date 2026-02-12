import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

/**
 * Simula o webhook do Mercado Pago confirmando pagamentos
 * Em produção, será chamado pelo Mercado Pago quando o PIX for confirmado
 * 
 * Para testar: curl -X POST http://localhost:3000/api/payment/webhook-sim -H "Content-Type: application/json" -d '{"purchaseId":"xxx","raffleId":"yyy"}'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { purchaseId, raffleId, action = 'confirm_all' } = body

    // 1️⃣ Confirmar uma compra específica
    if (action === 'confirm_one' && purchaseId && raffleId) {
      console.log('[Webhook Sim] Confirmando compra específica:', purchaseId)
      
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

      if (purchase.status === 'confirmed') {
        return NextResponse.json({
          success: true,
          message: 'Pagamento já confirmado',
          confirmedCount: 0,
        })
      }

      await queryOne(
        'UPDATE "rafflePurchase" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
        ['confirmed', purchaseId]
      )

      console.log('[Webhook Sim] ✅ Compra confirmada:', purchaseId)
      return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado com sucesso!',
        confirmedCount: 1,
      })
    }

    // 2️⃣ Confirmar todos os pagamentos pendentes (modo debug)
    if (action === 'confirm_all') {
      console.log('[Webhook Sim] Confirmando todos os pagamentos pendentes...')
      
      const pendingPurchases = await queryMany(
        `SELECT id, "raffleId" FROM "rafflePurchase" WHERE status = 'pending' LIMIT 100`,
        []
      )

      if (pendingPurchases.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Nenhum pagamento pendente',
          confirmedCount: 0,
        })
      }

      let confirmed = 0
      for (const purchase of pendingPurchases) {
        await queryOne(
          'UPDATE "rafflePurchase" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
          ['confirmed', purchase.id]
        )
        confirmed++
      }

      console.log('[Webhook Sim] ✅ Confirmados', confirmed, 'pagamentos')
      return NextResponse.json({
        success: true,
        message: `${confirmed} pagamento(s) confirmado(s)`,
        confirmedCount: confirmed,
      })
    }

    return NextResponse.json(
      { error: 'Action inválida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Webhook Sim] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
