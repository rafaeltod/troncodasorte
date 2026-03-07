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

        // Buscar números vendidos antecipadamente para excluí-los do drawnNumber
        const allSoldRows = await queryMany(
          `SELECT l.id, l."userId", l.numbers, u.name as "userName", u.email as "userEmail"
           FROM livros l
           LEFT JOIN "user" u ON l."userId" = u.id
           WHERE l."raffleId" = $1 AND l.status = 'confirmed' AND l."statusPago" = true AND l.numbers IS NOT NULL`,
          [id]
        )

        const numberToPurchase = new Map<string, { purchaseId: string; userId: string; userName: string; userEmail: string }>()
        for (const row of allSoldRows) {
          const nums = row.numbers.split(',').map((n: string) => n.trim())
          for (const num of nums) {
            if (num) numberToPurchase.set(num, { purchaseId: row.id, userId: row.userId, userName: row.userName, userEmail: row.userEmail })
          }
        }
        const soldSet = new Set(Array.from(numberToPurchase.keys()))

        // Passo 1: atribuir drawnNumber para prêmios com 0% que ainda não têm (mesmo sem vendas)
        const usedDrawnNumbers = new Set<string>(
          premiosConfig.filter((p: any) => p.drawnNumber).map((p: any) => p.drawnNumber)
        )

        function pickRandomNumber(excludeSet: Set<string>): string {
          let candidate: string
          let tries = 0
          do {
            const n = Math.floor(Math.random() * 999999) + 1
            candidate = String(n).padStart(6, '0')
            tries++
            if (tries > 2000000) break
          } while (excludeSet.has(candidate) || usedDrawnNumbers.has(candidate))
          return candidate
        }

        // Atribuir drawnNumber para prêmios com 0% que ainda não têm — excluindo números vendidos
        // drawnNumber é o bilhete vencedor: quem comprar exatamente esse número ganha
        let mapped = premiosConfig.map((p: any) => {
          if (p.winner || p.drawnNumber) return p
          if ((p.porcentagemSorteio ?? 0) !== 0) return p
          const drawnNumber = pickRandomNumber(soldSet)
          usedDrawnNumbers.add(drawnNumber)
          return { ...p, drawnNumber, number: drawnNumber }
        })

        // Passo 2a: atribuir drawnNumber para prêmios com porcentagem > 0% já atingida
        // Não depende de allSoldRows — só precisa do soldSet para evitar números comprados
        mapped = mapped.map((p: any) => {
          if (p.winner || p.drawnNumber) return p
          if ((p.porcentagemSorteio ?? 0) === 0) return p // tratado no passo 1
          if ((p.porcentagemSorteio ?? 0) > soldPct) return p // limiar ainda não atingido
          const dn = pickRandomNumber(soldSet)
          usedDrawnNumbers.add(dn)
          return { ...p, drawnNumber: dn, number: dn }
        })

        // Passo 2b: verificar se algum bilhete sorteado foi comprado (atribuir winner)
        if (allSoldRows.length > 0) {
          const usedWinnerNumbers = new Set<string>()
          for (const p of mapped) {
            if (p.number && soldSet.has(p.number) && p.winner) usedWinnerNumbers.add(p.number)
          }

          mapped = mapped.map((p: any) => {
            if (p.winner || !p.drawnNumber) return p
            const winnerData = numberToPurchase.get(p.drawnNumber)
            if (!winnerData || usedWinnerNumbers.has(p.drawnNumber)) return p
            usedWinnerNumbers.add(p.drawnNumber)
            return {
              ...p,
              number: p.drawnNumber,
              winner: {
                userId: winnerData.userId,
                name: winnerData.userName,
                email: winnerData.userEmail,
                purchaseId: winnerData.purchaseId,
              },
            }
          })
        }

        finalPremiosConfig = mapped
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
