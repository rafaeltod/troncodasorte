const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function addIsAdminColumn() {
  try {
    console.log('🔄 Adicionando coluna isAdmin na tabela user...')
    
    await pool.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE;
    `)
    
    console.log('✅ Coluna isAdmin adicionada com sucesso!')
    console.log('\n📝 Para tornar um usuário admin, execute:')
    console.log('   UPDATE "user" SET "isAdmin" = TRUE WHERE email = \'email@do.admin\';')
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna isAdmin:', error)
  } finally {
    await pool.end()
  }
}

addIsAdminColumn()
