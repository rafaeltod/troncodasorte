import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  try {
    // Mercado Pago envia via query params ou form data
    const searchParams = req.nextUrl.searchParams
    const body = await req.json().catch(() => ({}))

    console.log('[MP Webhook] Recebido evento:', {
      query: Object.fromEntries(searchParams),
      body,
    })

    // O Mercado Pago envia o tipo de evento via query param "topic" ou no body "action"
    const topic = searchParams.get('topic') || body.action
    const paymentId = searchParams.get('id') || body.data?.id

    // Se for um evento de pagamento
    if (topic === 'payment' && paymentId) {
      console.log(`[MP Webhook] Processando pagamento: ${paymentId}`)

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      )

      if (!paymentResponse.ok) {
        console.error('[MP Webhook] Erro ao buscar pagamento:', paymentResponse.statusText)
        return NextResponse.json(
          { error: 'Erro ao buscar pagamento' },
          { status: 400 }
        )
      }

      const payment = await paymentResponse.json()

      console.log('[MP Webhook] Detalhes do pagamento:', {
        id: payment.id,
        status: payment.status,
        transaction_amount: payment.transaction_amount,
        purchaseId: payment.metadata?.purchase_id,
        raffleId: payment.metadata?.raffle_id,
      })

      // Extrair purchaseId dos metadata
      const purchaseId = payment.metadata?.purchase_id || payment.metadata?.purchaseId

      if (!purchaseId) {
        console.warn('[MP Webhook] purchaseId não encontrado nos metadados')
        return NextResponse.json(
          { error: 'purchaseId não encontrado' },
          { status: 400 }
        )
      }

      // Se o pagamento foi aprovado/confirmado
      if (payment.status === 'approved') {
        console.log(`[MP Webhook] ✅ Pagamento aprovado! Confirmando compra: ${purchaseId}`)

        // Buscar a compra
        const purchase = await queryOne(
          'SELECT * FROM "rafflePurchase" WHERE id = $1',
          [purchaseId]
        )

        if (!purchase) {
          console.error(`[MP Webhook] Compra não encontrada: ${purchaseId}`)
          return NextResponse.json(
            { error: 'Compra não encontrada' },
            { status: 404 }
          )
        }

        // Verificar se o valor corresponde (segurança extra)
        const expectedAmount = Number(purchase.amount)
        const receivedAmount = payment.transaction_amount

        if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
          console.error('[MP Webhook] Valor do pagamento não corresponde:', {
            esperado: expectedAmount,
            recebido: receivedAmount,
          })
          return NextResponse.json(
            { error: 'Valor do pagamento não corresponde' },
            { status: 400 }
          )
        }

        // Atualizar status da compra para 'confirmed'
        const updatedPurchase = await queryOne(
          `UPDATE "rafflePurchase" 
           SET status = 'confirmed', "statusPago" = true, "updatedAt" = NOW()
           WHERE id = $1
           RETURNING *`,
          [purchaseId]
        )

        console.log('[MP Webhook] ✅ Compra confirmada:', {
          purchaseId: updatedPurchase.id,
          status: updatedPurchase.status,
          quotas: updatedPurchase.quotas,
          amount: updatedPurchase.amount,
        })

        // ✅ Agora sim atualizar soldQuotas da rifa pois o pagamento foi confirmado
        await queryOne(
          `UPDATE raffle 
           SET "soldQuotas" = "soldQuotas" + $1, "updatedAt" = NOW()
           WHERE id = $2`,
          [updatedPurchase.quotas, updatedPurchase.raffleId]
        )
        console.log('[MP Webhook] ✅ Cotas da rifa atualizadas')

        // Atualizar top buyer agora que a compra foi confirmada
        if (updatedPurchase.userId) {
          const existingBuyer = await queryOne(
            `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
            [updatedPurchase.userId]
          )

          if (existingBuyer) {
            // Atualizar comprador existente
            await queryOne(
              `UPDATE "topBuyer" 
               SET "totalSpent" = "totalSpent" + $1,
                   "totalQuotas" = "totalQuotas" + $2,
                   "raffleBought" = "raffleBought" + 1,
                   "updatedAt" = NOW()
               WHERE "userId" = $3`,
              [updatedPurchase.amount, updatedPurchase.quotas, updatedPurchase.userId]
            )
            console.log('[MP Webhook] ✅ TopBuyer atualizado (existente):', updatedPurchase.userId)
          } else {
            // Criar novo comprador
            await queryOne(
              `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalQuotas", "raffleBought", "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
              [updatedPurchase.userId, updatedPurchase.amount, updatedPurchase.quotas]
            )
            console.log('[MP Webhook] ✅ TopBuyer criado (novo):', updatedPurchase.userId)
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Compra confirmada',
          purchaseId,
        })
      } else if (payment.status === 'pending') {
        console.log(`[MP Webhook] ⏳ Pagamento pendente: ${purchaseId}`)
        // Compra continua como pending
        return NextResponse.json({
          success: true,
          message: 'Pagamento ainda pendente',
          purchaseId,
        })
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        console.log(`[MP Webhook] ❌ Pagamento rejeitado/cancelado: ${purchaseId}`)
        
        // Opcionalmente, deletar a compra se o pagamento foi rejeitado
        // Por enquanto, apenas logar
        
        return NextResponse.json({
          success: true,
          message: 'Pagamento rejeitado/cancelado',
          purchaseId,
        })
      }
    }

    // Se chegou aqui, é um tipo de evento que ignoramos
    console.log('[MP Webhook] Evento ignorado:', topic)

    return NextResponse.json({
      success: true,
      message: 'Evento processado',
    })
  } catch (error) {
    console.error('[MP Webhook] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
