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
