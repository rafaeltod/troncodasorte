import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

/**
 * Endpoint de SIMULAÇÃO para confirmar pagamentos PIX manualmente
 * Útil para desenvolvimento quando o webhook do Mercado Pago não está configurado
 * 
 * USO: GET /api/payment/confirm-manual?purchaseId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const purchaseId = searchParams.get('purchaseId')

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'purchaseId é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Manual Confirm] Confirmando compra manualmente:', purchaseId)

    // Buscar a compra
    const purchase = await queryOne('SELECT * FROM livros WHERE id = $1', [purchaseId])

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Se já está confirmado, retornar sucesso
    if (purchase.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        message: 'Compra já estava confirmada',
        purchaseId,
        status: 'confirmed',
      })
    }

    const livros = purchase.livros
    const raffleId = purchase.raffleId

    console.log('[Manual Confirm] Gerando números das cotas...')

    // Buscar números já usados neste lote
    const existingNumbers = await queryMany(
      `SELECT numbers FROM livros WHERE "raffleId" = $1 AND numbers != '' AND numbers IS NOT NULL AND status = 'confirmed'`,
      [raffleId]
    )

    const usedNumbers = new Set(
      existingNumbers.flatMap((row: { numbers: string }) =>
        row.numbers ? row.numbers.split(',') : []
      )
    )

    const livroNumbers: string[] = []
    while (livroNumbers.length < livros) {
      const randomNum = Math.floor(Math.random() * 1000000)
      const livroNumber = String(randomNum).padStart(6, '0')
      if (!usedNumbers.has(livroNumber)) {
        livroNumbers.push(livroNumber)
        usedNumbers.add(livroNumber)
      }
    }

    const numbersString = livroNumbers.join(',')

    console.log('[Manual Confirm] Números gerados:', numbersString)

    // Atualizar compra como confirmada
    await queryOne(
      `UPDATE livros 
       SET status = 'confirmed', 
           numbers = $1, 
           "updatedAt" = NOW()
       WHERE id = $2`,
      [numbersString, purchaseId]
    )

    // Atualizar contadores do lote
    await queryOne(
      `UPDATE lotes 
       SET "soldLivros" = "soldLivros" + $1,
           "updatedAt" = NOW()
       WHERE id = $2`,
      [livros, raffleId]
    )

    // Atualizar top buyer se houver userId
    if (purchase.userId) {
      const existingTopBuyer = await queryOne(
        `SELECT * FROM top_buyers WHERE "userId" = $1 AND "raffleId" = $2`,
        [purchase.userId, raffleId]
      )

      if (existingTopBuyer) {
        await queryOne(
          `UPDATE top_buyers 
           SET "totalLivros" = "totalLivros" + $1,
               "updatedAt" = NOW()
           WHERE "userId" = $2 AND "raffleId" = $3`,
          [livros, purchase.userId, raffleId]
        )
      } else {
        await queryOne(
          `INSERT INTO top_buyers ("userId", "raffleId", "totalLivros", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [purchase.userId, raffleId, livros]
        )
      }
    }

    console.log('[Manual Confirm] ✅ Compra confirmada com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Pagamento confirmado manualmente',
      purchaseId,
      numbers: numbersString,
      status: 'confirmed',
    })
  } catch (error) {
    console.error('[Manual Confirm] Erro:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao confirmar pagamento' 
      },
      { status: 500 }
    )
  }
}
