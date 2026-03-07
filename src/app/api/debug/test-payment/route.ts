import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

/**
 * Endpoint de DEBUG para testar status de pagamentos
 * GET /api/debug/test-payment?purchaseId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const purchaseId = searchParams.get('purchaseId')

    if (!purchaseId) {
      // Listar últimas 10 compras
      const recentPurchases = await queryMany(
        `SELECT id, "raffleId", status, "livros", amount, "createdAt", payment_id, numbers
         FROM livros 
         ORDER BY "createdAt" DESC 
         LIMIT 10`
      )

      return NextResponse.json({
        message: 'Últimas 10 compras',
        purchases: recentPurchases,
        env: {
          hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          nodeEnv: process.env.NODE_ENV,
        }
      })
    }

    // Buscar compra específica
    const purchase = await queryOne(
      `SELECT * FROM livros WHERE id = $1`,
      [purchaseId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Se tem payment_id, buscar detalhes no Mercado Pago
    let mpPayment = null
    if (purchase.payment_id && process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${purchase.payment_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            },
          }
        )

        if (mpResponse.ok) {
          mpPayment = await mpResponse.json()
        }
      } catch (err) {
        console.error('[Debug] Erro ao buscar pagamento no MP:', err)
      }
    }

    return NextResponse.json({
      purchase: {
        id: purchase.id,
        raffleId: purchase.raffleId,
        status: purchase.status,
        livros: purchase.livros,
        amount: purchase.amount,
        payment_id: purchase.payment_id,
        numbers: purchase.numbers,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
      },
      mercadoPago: mpPayment ? {
        id: mpPayment.id,
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
        transaction_amount: mpPayment.transaction_amount,
        date_created: mpPayment.date_created,
        date_approved: mpPayment.date_approved,
        external_reference: mpPayment.external_reference,
        metadata: mpPayment.metadata,
      } : null,
      analysis: {
        dbStatus: purchase.status,
        mpStatus: mpPayment?.status || 'N/A',
        hasPaymentId: !!purchase.payment_id,
        hasNumbers: !!purchase.numbers,
        needsConfirmation: purchase.status === 'pending' && mpPayment?.status === 'approved',
      }
    })
  } catch (error) {
    console.error('[Debug] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
