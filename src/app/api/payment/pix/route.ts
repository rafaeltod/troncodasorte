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

        if (data.point_of_interaction?.qr_code?.in_app_url) {
          return NextResponse.json({
            qrCode: data.point_of_interaction.qr_code.in_app_url,
            qrImage: data.point_of_interaction.qr_code.image_url,
            transactionId: data.id,
            status: 'pending',
          })
        }
      } catch (error) {
        console.log('Erro ao integrar com Mercado Pago, usando PIX estático', error)
      }
    }

    // Fallback: PIX estático para desenvolvimento
    // Em produção, isso não seria usado
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
