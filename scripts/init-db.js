require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function initDatabase() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Definida' : '❌ Não definida')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    const sqlFile = path.join(__dirname, '..', 'scripts', 'init-db.sql')
    const sql = fs.readFileSync(sqlFile, 'utf-8')

    console.log('🚀 Executando script de inicialização do banco...')
    await pool.query(sql)
    console.log('✅ Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

initDatabase()
