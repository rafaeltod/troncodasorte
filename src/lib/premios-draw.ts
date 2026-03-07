import { queryOne, queryMany } from '@/lib/db'

/**
 * Verifica se algum prêmio aleatório do lote teve sua porcentagem de ativação
 * atingida e, caso sim, realiza o sorteio automático do número vencedor.
 * Deve ser chamada após cada confirmação de pagamento.
 */
export async function autoDrawPremiosAleatorios(raffleId: string): Promise<void> {
  try {
    const lote = await queryOne(
      `SELECT "soldLivros", "totalLivros", "premiosConfig", status FROM lotes WHERE id = $1`,
      [raffleId]
    )

    if (!lote || lote.status === 'drawn' || !lote.premiosConfig) return

    let premiosConfig: any[]
    try {
      premiosConfig = typeof lote.premiosConfig === 'string'
        ? JSON.parse(lote.premiosConfig)
        : lote.premiosConfig
    } catch {
      return
    }

    if (!Array.isArray(premiosConfig) || premiosConfig.length === 0) return

    const soldPct = lote.totalLivros > 0
      ? (lote.soldLivros / lote.totalLivros) * 100
      : 0

    const needsDraw = premiosConfig.some(
      (p: any) => !p.winner && (
        (!p.drawnNumber && (p.porcentagemSorteio ?? 0) <= soldPct) ||
        p.drawnNumber // sorteado na criação (0%), aguardando winner
      )
    )

    if (!needsDraw) return

    // Buscar todos os números vendidos do lote
    const soldRows = await queryMany(
      `SELECT l.id, l."userId", l.numbers, u.name as "userName", u.email as "userEmail"
       FROM livros l
       LEFT JOIN "user" u ON l."userId" = u.id
       WHERE l."raffleId" = $1 AND l.status = 'confirmed' AND l."statusPago" = true AND l.numbers IS NOT NULL`,
      [raffleId]
    )

    if (soldRows.length === 0) return

    const numberToPurchase = new Map<string, { purchaseId: string; userId: string; userName: string; userEmail: string }>()
    for (const row of soldRows) {
      const nums = row.numbers.split(',').map((n: string) => n.trim())
      for (const num of nums) {
        if (num) numberToPurchase.set(num, { purchaseId: row.id, userId: row.userId, userName: row.userName, userEmail: row.userEmail })
      }
    }

    if (numberToPurchase.size === 0) return

    const soldSet = new Set(Array.from(numberToPurchase.keys()))

    const usedDrawnNumbers = new Set<string>()
    const usedWinnerNumbers = new Set<string>()
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

    let changed = false
    const updated = premiosConfig.map((p: any) => {
      if (p.winner) return p

      // Prêmio já teve drawnNumber sorteado na criação (0%) — só atribuir winner agora
      if (p.drawnNumber) {
        let currentNum = parseInt(p.drawnNumber, 10)
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
        if (!winnerNumber || !winnerData) return p
        usedWinnerNumbers.add(winnerNumber)
        changed = true
        return {
          ...p,
          number: winnerNumber,
          winner: {
            userId: winnerData.userId,
            name: winnerData.userName,
            email: winnerData.userEmail,
            purchaseId: winnerData.purchaseId,
          },
        }
      }

      if ((p.porcentagemSorteio ?? 0) > soldPct) return p

      const drawnNumber = pickUnsoldNumber()
      usedDrawnNumbers.add(drawnNumber)

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
        changed = true
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

    if (changed) {
      await queryOne(
        `UPDATE lotes SET "premiosConfig" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [JSON.stringify(updated), raffleId]
      )
    }
  } catch (err) {
    // Não bloqueia o fluxo de pagamento em caso de erro
    console.error('[autoDrawPremiosAleatorios] Erro:', err)
  }
}
