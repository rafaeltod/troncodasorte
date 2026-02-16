import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrateToLivros() {
  const client = await pool.connect()
  try {
    console.log('🔄 Iniciando migração de quotas → livros...\n')

    // 1. Renomear colunas na tabela raffle
    console.log('📊 Atualizando tabela raffle...')
    
    await client.query('ALTER TABLE raffle RENAME COLUMN "totalQuotas" TO "totalLivros"')
    console.log('  ✓ totalQuotas → totalLivros')
    
    await client.query('ALTER TABLE raffle RENAME COLUMN "soldQuotas" TO "soldLivros"')
    console.log('  ✓ soldQuotas → soldLivros')
    
    await client.query('ALTER TABLE raffle RENAME COLUMN "quotaPrice" TO "livroPrice"')
    console.log('  ✓ quotaPrice → livroPrice')

    // 2. Renomear coluna na tabela rafflePurchase
    console.log('\n🎟️ Atualizando tabela rafflePurchase...')
    
    await client.query('ALTER TABLE "rafflePurchase" RENAME COLUMN "quotas" TO "livros"')
    console.log('  ✓ quotas → livros')

    console.log('\n✅ Migração concluída com sucesso!')
    console.log('📝 Próximos passos:')
    console.log('  1. Rodar: npm run build')
    console.log('  2. Testar a aplicação')
    console.log('  3. Fazer commit das mudanças')
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message)
    process.exit(1)
  } finally {
    await client.release()
    await pool.end()
  }
}

migrateToLivros()
