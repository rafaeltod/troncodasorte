import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  try {
    const { purchaseId, raffleId, successUrl } = await req.json()

    if (!purchaseId || !raffleId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Pagamento via Mercado Pago não configurado' },
        { status: 503 }
      )
    }

    // Buscar dados reais da compra — nunca confiar no cliente
    const purchase = await queryOne(
      'SELECT "livros", "amount", "userId", "raffleId", "status" FROM livros WHERE id = $1',
      [purchaseId]
    )

    if (!purchase) {
      return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 })
    }

    const validatedAmount = Number(purchase.amount)
    const livroCount = Number(purchase.livros)

    // Buscar nome do lote para exibir no MP
    const lote = await queryOne('SELECT title FROM lotes WHERE id = $1', [raffleId])
    const loteTitle = lote?.title || `Lote ${String(raffleId).slice(0, 8)}`

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://troncodasorte.com.br'

    const preferenceBody = {
      items: [
        {
          id: purchaseId,
          title: `Livraria Fortuna, ${livroCount} livro(s)`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: validatedAmount,
        },
      ],
      external_reference: purchaseId,
      metadata: {
        purchase_id: purchaseId,
        raffle_id: raffleId,
      },
      back_urls: {
        success: successUrl || `${baseUrl}/meus-bilhetes/resultado`,
        failure: `${baseUrl}/compra/${purchaseId}?payment=failure`,
        pending: `${baseUrl}/compra/${purchaseId}?payment=pending`,
      },
      notification_url: `${baseUrl}/api/payment/webhook`,
      payment_methods: {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
          { id: 'atm' },
          { id: 'prepaid_card' },
          { id: 'digital_currency' },
          { id: 'digital_wallet' },
        ],
      },
    }

    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `pref-${purchaseId}`,
        },
        body: JSON.stringify(preferenceBody),
      }
    )

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error('[Checkout] Erro no Mercado Pago:', errorData)
      throw new Error(
        `Mercado Pago: ${errorData.message || mpResponse.statusText}`
      )
    }

    const preference = await mpResponse.json()
    console.log('[Checkout] ✅ Preferência criada:', {
      id: preference.id,
      init_point: preference.init_point,
    })

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error) {
    console.error('[Checkout] Erro ao criar preferência:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao criar checkout. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
