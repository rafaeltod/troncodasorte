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

    // Token é opcional (permite compras anônimas)
    const token = req.cookies.get('token')?.value || null

    // Validar dados
    if (!quotas || quotas < 1 || !amount || amount < 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se a campanha existe
    const raffle = await queryOne(
      'SELECT * FROM raffle WHERE id = $1',
      [id]
    )

    if (!raffle) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    // Se está logado, verificar se não é o criador
    if (token && raffle.creatorId === token) {
      return NextResponse.json(
        { error: 'Você não pode comprar cotas da sua própria campanha' },
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

    // Verificar se a campanha está aberta
    if (raffle.status !== 'open') {
      return NextResponse.json(
        { error: 'Esta campanha não está aberta para compras' },
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

    // Criar registro de compra (userId pode ser NULL para compras anônimas)
    const purchase = await queryOne(
      `INSERT INTO "rafflePurchase" (id, "userId", "raffleId", quotas, amount, numbers, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW(), NOW())
       ON CONFLICT ("userId", "raffleId") 
       DO UPDATE SET 
         quotas = "rafflePurchase".quotas + $3,
         amount = "rafflePurchase".amount + $4,
         numbers = "rafflePurchase".numbers || ',' || $5,
         "updatedAt" = NOW()
       RETURNING id, "raffleId", "userId", quotas, amount, status`,
      [token, id, quotas, amount, quotaNumbers]
    )

    if (!purchase) {
      throw new Error('Erro ao criar compra')
    }

    // Atualizar quantidade de cotas vendidas
    const updatedRaffle = await queryOne(
      `UPDATE raffle 
       SET "soldQuotas" = "soldQuotas" + $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING *`,
      [quotas, id]
    )

    if (!updatedRaffle) {
      throw new Error('Erro ao atualizar campanha')
    }

    // Atualizar top buyer apenas se o usuário está logado
    if (token) {
      const existingBuyer = await queryOne(
        `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
        [token]
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
          [amount, quotas, token]
        )
      } else {
        // Criar novo comprador
        await queryOne(
          `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalQuotas", "raffleBought", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
          [token, amount, quotas]
        )
      }
    }

    // TODO: Integrar com gateway de pagamento (Stripe, Mercado Pago, etc)
    // Por enquanto, marcar compra como confirmada (em produção seria 'pending')
    await queryOne(
      `UPDATE "rafflePurchase" SET status = 'confirmed' WHERE id = $1`,
      [purchase.id]
    )

    return NextResponse.json({
      purchaseId: purchase.id,
      message: 'Compra realizada com sucesso',
      checkoutUrl: null, // Será preenchido quando integrar com gateway
    }, { status: 201 })
  } catch (error) {
    console.error('Error in purchase:', error)
    return NextResponse.json(
      { error: 'Erro ao processar compra' },
      { status: 500 }
    )
  }
}
