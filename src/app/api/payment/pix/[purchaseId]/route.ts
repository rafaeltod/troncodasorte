import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

interface RouteProps {
  params: Promise<{
    purchaseId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { purchaseId } = await params

    // Validar token
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Você precisa estar logado' },
        { status: 401 }
      )
    }

    // Buscar a compra
    const purchase = await queryOne(
      `SELECT * FROM "rafflePurchase" WHERE id = $1 AND "userId" = $2`,
      [purchaseId, token]
    )

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se está pendente
    if (purchase.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta compra já foi confirmada' },
        { status: 400 }
      )
    }

    // Gerar chave PIX (mock - em produção seria recuperado do Mercado Pago)
    const pixKey = `${purchase.id.substring(0, 8)}.pix@troncodasorte.com`
    const transactionId = `TRX-${purchase.id}`
    
    // Mock QR code
    const mockQRCode = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12' font-family='monospace' fill='black'%3E${transactionId}%3C/text%3E%3C/svg%3E`

    return NextResponse.json({
      success: true,
      pixKey,
      transactionId,
      amount: Number(purchase.amount),
      qrCode: mockQRCode,
      expiresIn: 900,
      message: 'QR Code recuperado com sucesso',
    })
  } catch (error) {
    console.error('[Get PIX Error]:', error)
    return NextResponse.json(
      { error: 'Erro ao recuperar QR code' },
      { status: 500 }
    )
  }
}
