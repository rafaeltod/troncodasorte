require('dotenv').config()
const { Pool } = require('pg')

async function addPasswordColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log('🔧 Adicionando coluna password...')
    
    // Verificar se a coluna já existe
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'password'
      );
    `)

    if (result.rows[0].exists) {
      console.log('✅ Coluna password já existe!')
    } else {
      // Adicionar coluna
      await pool.query(`
        ALTER TABLE "user" 
        ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '123456'
      `)
      console.log('✅ Coluna password adicionada com sucesso!')
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addPasswordColumn()
