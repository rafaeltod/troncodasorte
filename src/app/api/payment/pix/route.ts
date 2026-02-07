import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

// Para desenvolvimento, usando uma chave PIX estática
// Em produção, integrar com API do Mercado Pago
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  try {
    const { purchaseId, amount, raffleId } = await req.json()

    // Validar token (usuário deve estar logado)
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (!purchaseId || !amount) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se tem Mercado Pago configurado
    if (MERCADO_PAGO_ACCESS_TOKEN) {
      // Integração real com Mercado Pago
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            // Mercado Pago exige um header de idempotência para criação de pagamentos
            // usamos o purchaseId recebido para garantir idempotência das requisições
            'X-Idempotency-Key': String(purchaseId),
          },
          body: JSON.stringify({
            transaction_amount: amount,
            description: `Compra de cotas - Rifa ${raffleId}`,
            payment_method_id: 'pix',
            payer: {
              email: `user_${token}@example.com`,
            },
            metadata: {
              purchaseId,
              raffleId,
            },
          }),
        })

        const data = await mpResponse.json()

        // Debug logging to help verify that the backend realmente chamou a API do Mercado Pago
        console.log('[MP POST] status=', mpResponse.status, 'ok=', mpResponse.ok)
        // Em ambiente de desenvolvimento, também logamos o body retornado
        if (process.env.NODE_ENV !== 'production') {
          console.log('[MP POST] body=', JSON.stringify(data))
        }

        // Try to extract the BR Code content and image from the initial response.
        // Mercado Pago can return fields in different places depending on integration/version.
        // Check several possible locations (point_of_interaction.qr_code, transaction_data.qr_code, qr_code_base64, etc.).
        let content =
          data.point_of_interaction?.qr_code?.content ||
          data.point_of_interaction?.qr_code?.qr_code ||
          data.point_of_interaction?.transaction_data?.qr_code ||
          data.transaction_data?.qr_code ||
          null

        // For image, Mercado Pago sometimes returns a base64 PNG in qr_code_base64
        let qrImage =
          data.point_of_interaction?.qr_code?.image_url ||
          data.point_of_interaction?.qr_code?.in_app_url ||
          null

        const base64Img =
          data.point_of_interaction?.transaction_data?.qr_code_base64 || data.transaction_data?.qr_code_base64 || null
        if (!qrImage && base64Img) {
          // convert base64 payload to data URL
          qrImage = `data:image/png;base64,${base64Img}`
        }

        // Sometimes Mercado Pago does not include the `content` in the initial POST response.
        // In that case, fetch the payment resource to retrieve `point_of_interaction.qr_code.content`.
        if (data.id && !content) {
          try {
            const mpGet = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
            })

            if (mpGet.ok) {
              const getData = await mpGet.json()
              // same extraction from GET response
              content =
                getData.point_of_interaction?.qr_code?.content ||
                getData.point_of_interaction?.qr_code?.qr_code ||
                getData.point_of_interaction?.transaction_data?.qr_code ||
                getData.transaction_data?.qr_code ||
                content

              const getBase64 =
                getData.point_of_interaction?.transaction_data?.qr_code_base64 || getData.transaction_data?.qr_code_base64 || null
              qrImage =
                qrImage ||
                getData.point_of_interaction?.qr_code?.image_url ||
                (getBase64 ? `data:image/png;base64,${getBase64}` : null) ||
                null
            }
          } catch (err) {
            console.error('Erro fetching payment details from Mercado Pago:', err)
          }
        }

        if (content || qrImage) {
          const resp: any = {
            qrCode: qrImage,
            qrImage: qrImage,
            content,
            transactionId: data.id,
            status: 'pending',
          }

          // Em DEV, inclua também o corpo bruto retornado pelo MP para inspeção pelo frontend
          if (process.env.NODE_ENV !== 'production') {
            resp.mpDebug = {
              status: mpResponse.status,
              ok: mpResponse.ok,
              body: data,
            }
          }

          return NextResponse.json(resp)
        }
      } catch (error) {
        // Usar PIX estático se Mercado Pago falhar
        console.error('[MP POST] erro ao chamar Mercado Pago:', error)
      }
    }

    // PIX estático para desenvolvimento
    const pixKey = 'mercado-pago@troncodasorte.com.br'
    const qrCodeData = {
      pix: pixKey,
      amount: amount.toFixed(2),
      description: `Compra de cotas - Rifa ${raffleId}`,
      transactionId: purchaseId,
      expiresIn: 3600, // 1 hora
    }

    // Gerar um QR code mock para desenvolvimento
    // Em produção, usar biblioteca como 'qrcode'
    return NextResponse.json({
      qrCode: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='black'%3E${pixKey}%3C/text%3E%3C/svg%3E`,
      pixKey: pixKey,
      amount: amount.toFixed(2),
      transactionId: purchaseId,
      status: 'pending',
      message: 'PIX Mock para desenvolvimento. Configure MERCADO_PAGO_ACCESS_TOKEN para pagamento real.',
    })
  } catch (error) {
    console.error('Error creating PIX payment:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
