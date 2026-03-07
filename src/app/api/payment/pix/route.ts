import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import QRCode from 'qrcode'

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  try {
    const { purchaseId, amount, raffleId } = await req.json()

    // Token é opcional (permite pagamentos anônimos)
    const token = req.cookies.get('token')?.value || null

    if (!purchaseId || !raffleId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // IMPORTANTE: Buscar os dados reais da compra do banco
    // NÃO confiar no amount enviado pelo cliente
    const purchase = await queryOne(
      'SELECT "livros", "amount", "userId", "raffleId", "status" FROM livros WHERE id = $1',
      [purchaseId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Usar o valor validado do banco (NÃO o enviado pelo cliente)
    const validatedAmount = Number(purchase.amount)
    const livroCount = purchase.livros

    console.log('[Payment] Recuperei a compra do banco:', {
      purchaseId,
      livros: purchase.livros,
      amount: purchase.amount,
      validatedAmount,
      type: typeof purchase.amount,
    })

    // ✅ INTEGRAÇÃO REAL COM MERCADO PAGO
    if (MERCADO_PAGO_ACCESS_TOKEN) {
      console.log('[Payment] Criando pagamento PIX no Mercado Pago...')
      
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            'X-Idempotency-Key': purchaseId, // Evita pagamentos duplicados
          },
          body: JSON.stringify({
            transaction_amount: validatedAmount,
            description: `Compra de ${livroCount} livro(s) - Lote #${raffleId}`,
            payment_method_id: 'pix',
            payer: {
              email: 'comprador@troncodasorte.com.br',
              first_name: 'Cliente',
              last_name: 'Tronco da Sorte',
            },
            external_reference: purchaseId,
            notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://troncodasorte.com.br'}/api/payment/webhook`,
          }),
        })

        if (!mpResponse.ok) {
          const errorData = await mpResponse.json()
          console.error('[Payment] Erro no Mercado Pago:', errorData)
          throw new Error(`Mercado Pago retornou erro: ${errorData.message || mpResponse.statusText}`)
        }

        const payment = await mpResponse.json()
        console.log('[Payment] ✅ Pagamento criado no Mercado Pago:', {
          id: payment.id,
          status: payment.status,
          hasQRCode: !!payment.point_of_interaction?.transaction_data?.qr_code,
        })

        // Extrair dados do PIX
        const qrCodeContent = payment.point_of_interaction?.transaction_data?.qr_code
        const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64

        if (!qrCodeContent) {
          console.error('[Payment] ⚠️ Mercado Pago não retornou QR code')
          throw new Error('QR code PIX não disponível')
        }

        // Salvar payment_id na compra para rastreamento
        await queryOne(
          'UPDATE livros SET payment_id = $1 WHERE id = $2',
          [payment.id, purchaseId]
        )

        // Gerar QR code SVG a partir do código EMV
        let qrCodeSVG = null
        if (qrCodeContent) {
          try {
            const svgString = await QRCode.toString(qrCodeContent, {
              type: 'svg',
              width: 300,
              margin: 1,
            })
            qrCodeSVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString)
          } catch (err) {
            console.error('[Payment] Erro ao gerar SVG do QR:', err)
          }
        }

        return NextResponse.json({
          qrCode: qrCodeSVG || (qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null),
          pixKey: qrCodeContent, // Código PIX copia e cola (EMV/BR Code)
          content: qrCodeContent,
          amount: validatedAmount.toFixed(2),
          transactionId: payment.id,
          purchaseId: purchaseId,
          livros: livroCount,
          status: payment.status,
          expiresAt: payment.date_of_expiration,
          source: 'mercado_pago',
        })
      } catch (mpError) {
        console.error('[Payment] ❌ Erro na integração com Mercado Pago:', mpError)
        // Em caso de erro, não usar fallback - retornar erro para o usuário
        return NextResponse.json(
          { 
            error: mpError instanceof Error 
              ? mpError.message 
              : 'Erro ao gerar pagamento PIX. Tente novamente.'
          },
          { status: 500 }
        )
      }
    }

    // ❌ FALLBACK: Se não tem token do Mercado Pago configurado
    console.warn('[Payment] ⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado - usando fallback')
    
    const pixKey = 'mercado-pago@troncodasorte.com.br'
    let pixSVG = null
    
    try {
      pixSVG = await QRCode.toString(pixKey, {
        type: 'svg',
        width: 300,
      })
    } catch (err) {
      console.log('[Payment] Erro ao gerar QR para PIX key:', err)
    }
    
    return NextResponse.json({
      qrCode: pixSVG ? 'data:image/svg+xml;utf8,' + encodeURIComponent(pixSVG) : null,
      pixKey: pixKey,
      content: pixKey,
      amount: validatedAmount.toFixed(2),
      transactionId: purchaseId,
      livros: livroCount,
      status: 'pending',
      source: 'fallback_pix_mock',
      message: '⚠️ MODO DESENVOLVIMENTO - Configure MERCADO_PAGO_ACCESS_TOKEN para pagamentos reais',
    })
  } catch (error) {
    console.error('Error creating PIX payment:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
