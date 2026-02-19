import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é admin
    const user = await queryOne(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [token]
    )

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem cadastrar resultado.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { drawnNumber } = body

    // Validar o número informado
    if (!drawnNumber || typeof drawnNumber !== 'string') {
      return NextResponse.json(
        { error: 'Número do sorteio é obrigatório' },
        { status: 400 }
      )
    }

    const cleanNumber = drawnNumber.trim().padStart(6, '0')

    if (!/^\d{6}$/.test(cleanNumber)) {
      return NextResponse.json(
        { error: 'O número deve ter 6 dígitos (000000 a 999999)' },
        { status: 400 }
      )
    }

    // Verificar se o lote existe
    const lote = await queryOne(
      `SELECT id, status, winner FROM lotes WHERE id = $1`,
      [id]
    )

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrado' },
        { status: 404 }
      )
    }

    if (lote.status === 'drawn') {
      return NextResponse.json(
        { error: 'Este lote já possui um resultado cadastrado' },
        { status: 400 }
      )
    }

    if (lote.status !== 'closed') {
      return NextResponse.json(
        { error: 'O lote precisa estar finalizado (fechado) antes de cadastrar o resultado' },
        { status: 400 }
      )
    }

    // Buscar todas as compras confirmadas desse lote com números
    const purchases = await queryMany(
      `SELECT l.id, l."userId", l.numbers, u.name as "userName", u.email as "userEmail"
       FROM livros l
       LEFT JOIN "user" u ON l."userId" = u.id
       WHERE l."raffleId" = $1 
         AND l.status = 'confirmed' 
         AND l.numbers IS NOT NULL 
         AND l.numbers != ''`,
      [id]
    )

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Não há compras confirmadas neste lote para realizar o sorteio' },
        { status: 400 }
      )
    }

    // Montar um Set com todos os números de bilhete e um mapa número -> compra
    const numberToPurchase = new Map<string, { purchaseId: string; userId: string; userName: string; userEmail: string }>()

    for (const purchase of purchases) {
      const nums = purchase.numbers.split(',').map((n: string) => n.trim())
      for (const num of nums) {
        if (num) {
          numberToPurchase.set(num, {
            purchaseId: purchase.id,
            userId: purchase.userId,
            userName: purchase.userName,
            userEmail: purchase.userEmail,
          })
        }
      }
    }

    if (numberToPurchase.size === 0) {
      return NextResponse.json(
        { error: 'Nenhum bilhete encontrado nas compras confirmadas' },
        { status: 400 }
      )
    }

    // Buscar o número vencedor: começar pelo drawnNumber, incrementar se necessário
    let currentNumber = parseInt(cleanNumber, 10)
    let winnerNumber: string | null = null
    let winnerData: { purchaseId: string; userId: string; userName: string; userEmail: string } | null = null
    let attempts = 0
    const maxAttempts = 1000000 // evitar loop infinito

    while (attempts < maxAttempts) {
      const formatted = String(currentNumber).padStart(6, '0')

      if (numberToPurchase.has(formatted)) {
        winnerNumber = formatted
        winnerData = numberToPurchase.get(formatted)!
        break
      }

      // Incrementar: se chegar a 999999, volta para 000001
      currentNumber++
      if (currentNumber > 999999) {
        currentNumber = 1 // pula o 000000, volta para 000001
      }

      attempts++
    }

    if (!winnerNumber || !winnerData) {
      return NextResponse.json(
        { error: 'Não foi possível encontrar um bilhete correspondente' },
        { status: 500 }
      )
    }

    // Atualizar o lote com o resultado
    const updated = await queryOne(
      `UPDATE lotes 
       SET status = 'drawn', 
           winner = $2, 
           "drawnNumber" = $3, 
           "winnerNumber" = $4,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, title, status, winner, "drawnNumber", "winnerNumber"`,
      [id, winnerData.userId, cleanNumber, winnerNumber]
    )

    return NextResponse.json({
      message: 'Resultado cadastrado com sucesso!',
      lote: updated,
      resultado: {
        drawnNumber: cleanNumber,
        winnerNumber,
        incrementos: attempts,
        winner: {
          userId: winnerData.userId,
          name: winnerData.userName,
          email: winnerData.userEmail,
          purchaseId: winnerData.purchaseId,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao cadastrar resultado:', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar resultado do sorteio' },
      { status: 500 }
    )
  }
}
