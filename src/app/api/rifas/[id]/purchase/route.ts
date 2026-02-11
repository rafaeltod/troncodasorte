import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

interface RouteProps {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params
    const { quotas, amount } = await req.json()

    // Token opcional - usuários podem comprar sem estar logados
    // Se não estiver logado, userId será NULL (compra anônima)
    const userId = req.cookies.get('token')?.value || null

    // Validar dados
    if (!quotas || quotas < 1 || !amount || amount < 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se a rifa existe
    const raffle = await queryOne(
      'SELECT * FROM raffle WHERE id = $1',
      [id]
    )

    if (!raffle) {
      return NextResponse.json(
        { error: 'Rifa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o criador (apenas se estiver logado)
    if (req.cookies.get('token')?.value && raffle.creatorId === req.cookies.get('token')?.value) {
      return NextResponse.json(
        { error: 'Você não pode comprar cotas da sua própria rifa' },
        { status: 403 }
      )
    }

    // Verificar se há cotas disponíveis
    const availableQuotas = raffle.totalQuotas - raffle.soldQuotas
    if (quotas > availableQuotas) {
      return NextResponse.json(
        { error: 'Quantidade de cotas indisponível' },
        { status: 400 }
      )
    }

    // Verificar se a rifa está aberta
    if (raffle.status !== 'open') {
      return NextResponse.json(
        { error: 'Esta rifa não está aberta para compras' },
        { status: 400 }
      )
    }

    // VALIDAR O VALOR: confirmar que amount = quotas × quotaPrice
    const expectedAmount = quotas * raffle.quotaPrice
    const tolerance = 0.01 // margem de erro para floating point
    if (Math.abs(amount - expectedAmount) > tolerance) {
      console.warn(`[Purchase] Valor inválido! Esperado: ${expectedAmount}, Recebido: ${amount}`)
      return NextResponse.json(
        { 
          error: 'Valor da compra inválido',
          details: {
            expected: expectedAmount,
            received: amount
          }
        },
        { status: 400 }
      )
    }

    // Gerar números das cotas (exemplo: "1,2,3,4,5" para 5 cotas)
    const startNumber = raffle.soldQuotas + 1
    const endNumber = raffle.soldQuotas + quotas
    const quotaNumbers = Array.from(
      { length: quotas },
      (_, i) => String(startNumber + i)
    ).join(',')

    // Criar registro de compra
    const purchase = await queryOne(
      `INSERT INTO "rafflePurchase" (id, "userId", "raffleId", quotas, amount, numbers, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW(), NOW())
       RETURNING id, "raffleId", "userId", quotas, amount, status`,
      [userId, id, quotas, amount, quotaNumbers]
    )

    if (!purchase) {
      throw new Error('Erro ao criar compra')
    }

    console.log('[Purchase] Compra criada:', {
      purchaseId: purchase.id,
      quotas: purchase.quotas,
      amount: purchase.amount,
      expectedAmount: expectedAmount,
      formula: `${quotas} × ${raffle.quotaPrice} = ${expectedAmount}`
    })

    // Atualizar quantidade de cotas vendidas
    const updatedRaffle = await queryOne(
      `UPDATE raffle 
       SET "soldQuotas" = "soldQuotas" + $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING *`,
      [quotas, id]
    )

    if (!updatedRaffle) {
      throw new Error('Erro ao atualizar rifa')
    }

    // Atualizar top buyer (apenas se estiver logado)
    const userToken = req.cookies.get('token')?.value
    if (userToken) {
      const existingBuyer = await queryOne(
        `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
        [userToken]
      )

      if (existingBuyer) {
        // Atualizar comprador existente
        await queryOne(
          `UPDATE "topBuyer" 
           SET "totalSpent" = "totalSpent" + $1,
               "totalQuotas" = "totalQuotas" + $2,
               "raffleBought" = "raffleBought" + 1,
               "updatedAt" = NOW()
           WHERE "userId" = $3`,
          [amount, quotas, userToken]
        )
      } else {
        // Criar novo comprador
        await queryOne(
          `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalQuotas", "raffleBought", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
          [userToken, amount, quotas]
        )
      }
    }

    return NextResponse.json({
      purchaseId: purchase.id,
      message: 'Compra criada! Aguardando pagamento...',
      checkoutUrl: null, // Será preenchido quando integrar com gateway
    }, { status: 201 })
  } catch (error) {
    console.error('Error in purchase:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro ao processar compra: ${errorMessage}` },
      { status: 500 }
    )
  }
}
