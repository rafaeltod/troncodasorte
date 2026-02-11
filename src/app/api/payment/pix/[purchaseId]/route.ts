import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

interface RouteProps {
  params: Promise<{
    purchaseId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { purchaseId } = await params

    // Token opcional - usuários podem recuperar QR code sem estar logados
    const token = req.cookies.get('token')?.value

    // Buscar a compra
    // Token opcional - buscar a compra sem validação de propriedade
    const purchase = await queryOne(
      `SELECT * FROM "rafflePurchase" WHERE id = $1`,
      [purchaseId]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Se tem token de Mercado Pago, tentar buscar dados reais
    if (MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        // Buscar pagamentos usando o purchaseId no metadata
        const mpSearchResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/search?metadata.purchaseId=${purchaseId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (mpSearchResponse.ok) {
          const searchData = await mpSearchResponse.json()
          const payment = searchData.results?.[0]

          if (payment) {
            // Extrair QR code e chave PIX do payment
            let content =
              payment.point_of_interaction?.qr_code?.content ||
              payment.point_of_interaction?.transaction_data?.qr_code ||
              null

            let qrImage =
              payment.point_of_interaction?.qr_code?.image_url ||
              null

            const base64Img =
              payment.point_of_interaction?.transaction_data?.qr_code_base64 ||
              null
            if (!qrImage && base64Img) {
              qrImage = `data:image/png;base64,${base64Img}`
            }

            if (content || qrImage) {
              return NextResponse.json({
                success: true,
                transactionId: payment.id,
                content,
                pixKey: content,
                qrCode: qrImage,
                amount: Number(purchase.amount),
                status: purchase.status,
                message: 'QR Code recuperado do Mercado Pago',
              })
            }
          }
        }
      } catch (error) {
        console.error('[GET PIX] Erro ao buscar do Mercado Pago:', error)
        // Continuar com fallback se falhar
      }
    }

    // Fallback: retornar dados básicos da compra
    const pixKey = 'mercado-pago@troncodasorte.com.br'
    const mockQRCode = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='black'%3E${pixKey}%3C/text%3E%3C/svg%3E`

    return NextResponse.json({
      success: true,
      pixKey,
      transactionId: purchaseId,
      amount: Number(purchase.amount),
      qrCode: mockQRCode,
      expiresIn: 900,
      message: 'QR Code em modo fallback (configure MERCADO_PAGO_ACCESS_TOKEN para integração completa)',
    })
  } catch (error) {
    console.error('[Get PIX Error]:', error)
    return NextResponse.json(
      { error: 'Erro ao recuperar QR code' },
      { status: 500 }
    )
  }
}
