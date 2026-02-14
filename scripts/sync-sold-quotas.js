import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

async function syncSoldQuotas() {
  try {
    console.log('Sincronizando cotas vendidas com compras pagas...\n')
    
    // Buscar todas as rifas
    const raffles = await pool.query(`
      SELECT id, title, "totalLivros", "soldLivros"
      FROM lotes
      ORDER BY "createdAt" DESC
    `)
    
    console.log(`Encontradas ${raffles.rows.length} rifa(s)\n`)
    
    let updated = 0
    
    for (const raffle of raffles.rows) {
      // Contar compras pagas (statusPago = true)
      const purchases = await pool.query(`
        SELECT COALESCE(SUM(quotas), 0) as total
        FROM livros
        WHERE "raffleId" = $1 AND "statusPago" = true
      `, [raffle.id])
      
      const totalQuotas = purchases.rows[0].total
      
      if (totalQuotas !== raffle.soldQuotas) {
        console.log(`${raffle.title}:`)
        console.log(`  Antes: ${raffle.soldQuotas}/${raffle.totalQuotas} (${((raffle.soldQuotas / raffle.totalQuotas) * 100).toFixed(2)}%)`)
        console.log(`  Depois: ${totalQuotas}/${raffle.totalQuotas} (${((totalQuotas / raffle.totalQuotas) * 100).toFixed(2)}%)`)
        
        // Atualizar
        await pool.query(`
          UPDATE lotes
          SET "soldQuotas" = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, [totalQuotas, raffle.id])
        
        updated++
        console.log(`  ✅ Sincronizado\n`)
      }
    }
    
    console.log(`\n✅ Total de ${updated} rifa(s) sincronizada(s)`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

syncSoldQuotas()
