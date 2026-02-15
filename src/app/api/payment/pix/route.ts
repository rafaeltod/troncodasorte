import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import QRCode from 'qrcode'

// Para desenvolvimento, usando uma chave PIX estática
// Em produção, integrar com API do Mercado Pago
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

    // Verificar se tem Mercado Pago configurado
    if (MERCADO_PAGO_ACCESS_TOKEN) {
      console.log('[Payment] Tentando chamar Mercado Pago...')
      // Integração real com Mercado Pago
      try {
        const payerEmail = token 
          ? `user_${token}@example.com`
          : `anonymous@example.com`

        const requestPayload = {
          transaction_amount: validatedAmount,
          description: `Compra de ${livroCount} ebook (s) - Mudando sua vida - ${raffleId}`,
          payment_method_id: 'pix',
          payer: {
            email: payerEmail,
          },
          metadata: {
            purchase_id: purchaseId,  // snake_case para consistência com MP
            raffle_id: raffleId,      // snake_case para consistência com MP
          },
        }

        console.log('[Payment] Payload para Mercado Pago:', {
          transaction_amount: validatedAmount,
          payment_method_id: 'pix',
          payer_email: payerEmail,
        })

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${purchaseId}-${Date.now()}`,
          },
          body: JSON.stringify(requestPayload),
        })

        const data = await mpResponse.json()

        console.log('[Payment] Status do Mercado Pago:', mpResponse.status)
        console.log('[Payment] Resposta completa:', JSON.stringify(data, null, 2))

        // Tentar múltiplos caminhos possíveis para o QR code do Mercado Pago
        let qrCodeUrl = data.point_of_interaction?.qr_code?.in_app_url
        let qrCodeContent = data.point_of_interaction?.qr_code?.content

        // Se não encontrou, tenta outros caminhos
        if (!qrCodeContent) {
          qrCodeContent = data.point_of_interaction?.transaction_data?.qr_code
        }
        if (!qrCodeContent && data.point_of_interaction?.qr_code) {
          qrCodeContent = data.point_of_interaction.qr_code.raw_value || data.point_of_interaction.qr_code.content
        }

        // Se encontrou QR code da API do Mercado Pago
        if (qrCodeUrl) {
          console.log('[Payment] ✅ QR Code URL do Mercado Pago encontrado!')
          
          // Salvar payment_id na compra para referência futura
          if (data.id) {
            await queryOne(
              'UPDATE livros SET payment_id = $1, "updatedAt" = NOW() WHERE id = $2',
              [String(data.id), purchaseId]
            )
            console.log('[Payment] payment_id salvo:', data.id)
          }
          
          return NextResponse.json({
            qrCode: qrCodeUrl,
            qrImage: data.point_of_interaction.qr_code.image_url,
            content: qrCodeContent,
            transactionId: data.id,
            status: 'pending',
          })
        }

        // Se encontrou o conteúdo (BR Code), gerar QR code localmente
        if (qrCodeContent) {
          console.log('[Payment] ✅ QR Code content encontrado! Gerando QR localmente...')
          
          // Salvar payment_id na compra para referência futura
          if (data.id) {
            await queryOne(
              'UPDATE livros SET payment_id = $1, "updatedAt" = NOW() WHERE id = $2',
              [String(data.id), purchaseId]
            )
            console.log('[Payment] 💾 payment_id salvo:', data.id)
          }
          
          try {
            const qrSVG = await QRCode.toString(qrCodeContent, {
              type: 'svg',
              width: 300,
            })
            const qrDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(qrSVG)
            
            return NextResponse.json({
              qrCode: qrDataUrl,
              content: qrCodeContent,
              transactionId: data.id,
              status: 'pending',
              source: 'mercado_pago_generated',
            })
          } catch (qrError) {
            console.error('[Payment] Erro ao gerar QR localmente:', qrError)
            // Se falhar, retorna pelo menos o conteúdo para copiar
            return NextResponse.json({
              qrCode: null,
              content: qrCodeContent,
              pixKey: qrCodeContent,
              transactionId: data.id,
              status: 'pending',
              source: 'mercado_pago_content_only',
            })
          }
        }

        // Se chegou aqui, a resposta do MP não tem QR code
        console.log('[Payment] ⚠️ Estrutura do QR Code não encontrada na resposta do MP')
        console.log('[Payment] Data completo:', JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('[Payment] ❌ Erro ao chamar Mercado Pago:', error)
      }
    } else {
      console.log('[Payment] MERCADO_PAGO_ACCESS_TOKEN não configurado, usando fallback')
    }

    // PIX estático para desenvolvimento (fallback)
    console.log('[Payment] Usando PIX mock como fallback')
    
    // Tentar gerar QR code para a chave PIX
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
      message: 'PIX em modo fallback. Configure MERCADO_PAGO_ACCESS_TOKEN para integração completa.',
    })
  } catch (error) {
    console.error('Error creating PIX payment:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
