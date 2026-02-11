import { queryOne } from '@/lib/db'

async function migrate() {
  try {
    console.log('Iniciando migração: permitir NULL em userId para compras anônimas...')
    
    // Alterar a coluna para permitir NULL
    await queryOne(`
      ALTER TABLE "rafflePurchase" 
      ALTER COLUMN "userId" DROP NOT NULL
    `, [])
    
    console.log('✅ Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro na migração:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

migrate()
