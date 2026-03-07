import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query, queryMany } from '@/lib/db'

export async function GET(
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Buscar lote
    const lote = await queryOne(
      `SELECT 
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as creator
       FROM lotes r
       JOIN "user" u ON r."creatorId" = u.id
       WHERE r.id = $1 AND r."creatorId" = $2`,
      [id, token]
    )

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(lote)
  } catch (error) {
    console.error('Error fetching lote:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lote' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    
    const { title, description, prizeAmount, totalLivros, livroPrice, status, images, premiosConfig } = body

    // ✅ Remover espaços em branco do status
    const cleanStatus = status?.trim?.() || status

    // Serializar premiosConfig se fornecido, com sorteio automático para prêmios já atingidos
    let finalPremiosConfig = premiosConfig

    if (premiosConfig !== undefined && Array.isArray(premiosConfig)) {
      // Buscar dados atuais do lote para calcular soldPct
      const loteData = await queryOne(
        `SELECT "soldLivros", "totalLivros" FROM lotes WHERE id = $1`,
        [id]
      )

      if (loteData && loteData.totalLivros > 0) {
        const soldPct = (loteData.soldLivros / loteData.totalLivros) * 100

        // Verificar se algum prêmio precisa de sorteio automático (sem winner, porcentagem já atingida)
        const needsDraw = premiosConfig.some(
          (p: any) => !p.winner && !p.drawnNumber && (p.porcentagemSorteio ?? 0) <= soldPct
        )

        if (needsDraw) {
          // Buscar todos os números vendidos nesse lote
          const soldRows = await queryMany(
            `SELECT l.id, l."userId", l.numbers, u.name as "userName", u.email as "userEmail"
             FROM livros l
             LEFT JOIN "user" u ON l."userId" = u.id
             WHERE l."raffleId" = $1 AND l.status = 'confirmed' AND l."statusPago" = true AND l.numbers IS NOT NULL`,
            [id]
          )

          const numberToPurchase = new Map<string, { purchaseId: string; userId: string; userName: string; userEmail: string }>()
          for (const row of soldRows) {
            const nums = row.numbers.split(',').map((n: string) => n.trim())
            for (const num of nums) {
              if (num) numberToPurchase.set(num, { purchaseId: row.id, userId: row.userId, userName: row.userName, userEmail: row.userEmail })
            }
          }

          const soldSet = new Set(Array.from(numberToPurchase.keys()))
          const usedDrawnNumbers = new Set<string>()
          const usedWinnerNumbers = new Set<string>()
          // Reservar drawnNumbers e winnerNumbers já atribuídos
          for (const p of premiosConfig) {
            if (p.drawnNumber) usedDrawnNumbers.add(p.drawnNumber)
            if (p.number && soldSet.has(p.number)) usedWinnerNumbers.add(p.number)
          }

          function pickUnsoldNumber(): string {
            let candidate: string
            let tries = 0
            do {
              const n = Math.floor(Math.random() * 999999) + 1
              candidate = String(n).padStart(6, '0')
              tries++
              if (tries > 2000000) break
            } while (soldSet.has(candidate) || usedDrawnNumbers.has(candidate))
            return candidate
          }

          finalPremiosConfig = premiosConfig.map((p: any) => {
            // Se já tem winner ou porcentagem não atingida, manter como está
            if (p.winner || p.drawnNumber || (p.porcentagemSorteio ?? 0) > soldPct) return p

            const drawnNumber = pickUnsoldNumber()
            usedDrawnNumbers.add(drawnNumber)

            // Incrementar a partir do drawnNumber até encontrar um número vendido não usado
            let currentNum = parseInt(drawnNumber, 10)
            let winnerNumber: string | null = null
            let winnerData: { purchaseId: string; userId: string; userName: string; userEmail: string } | null = null
            let attempts = 0
            while (attempts < 1000000) {
              const formatted = String(currentNum).padStart(6, '0')
              if (numberToPurchase.has(formatted) && !usedWinnerNumbers.has(formatted)) {
                winnerNumber = formatted
                winnerData = numberToPurchase.get(formatted)!
                break
              }
              currentNum++
              if (currentNum > 999999) currentNum = 1
              attempts++
            }

            if (winnerNumber && winnerData) {
              usedWinnerNumbers.add(winnerNumber)
              return {
                ...p,
                drawnNumber,
                number: winnerNumber,
                winner: {
                  userId: winnerData.userId,
                  name: winnerData.userName,
                  email: winnerData.userEmail,
                  purchaseId: winnerData.purchaseId,
                },
              }
            }
            return p
          })
        }
      }
    }

    const premiosConfigStr = finalPremiosConfig !== undefined
      ? JSON.stringify(finalPremiosConfig)
      : null

    // Verificar se a lote pertence ao admin
    const lote = await queryOne(
      `SELECT id FROM lotes WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrada ou você não tem permissão para editá-la' },
        { status: 404 }
      )
    }

    // Atualizar lote
    const updated = await queryOne(
      `UPDATE lotes 
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         "prizeAmount" = COALESCE($3, "prizeAmount"),
         "totalLivros" = COALESCE($4, "totalLivros"),
         "livroPrice" = COALESCE($5, "livroPrice"),
         status = COALESCE($6, status),
         images = COALESCE($7, images),
         image = COALESCE($8, image),
         "premiosConfig" = COALESCE($11, "premiosConfig"),
         "qtdPremiosAleatorios" = CASE WHEN $11 IS NOT NULL THEN (SELECT json_array_length($11::json)) ELSE "qtdPremiosAleatorios" END,
         "updatedAt" = NOW()
       WHERE id = $9 AND "creatorId" = $10
       RETURNING *`,
      [
        title,
        description,
        prizeAmount,
        totalLivros,
        livroPrice,
        cleanStatus,
        images || null,
        images?.[0] || null,
        id,
        token,
        premiosConfigStr,
      ]
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating lote:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lote' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se a lote pertence ao admin
    const lote = await queryOne(
      `SELECT id FROM lotes WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrada ou você não tem permissão para deletá-la' },
        { status: 404 }
      )
    }

    // Deletar compras associadas primeiro
    await query(
      `DELETE FROM livros WHERE "raffleId" = $1`,
      [id]
    )

    // Deletar lote
    await query(
      `DELETE FROM lotes WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lote:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar lote' },
      { status: 500 }
    )
  }
}
