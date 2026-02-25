const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

async function setVendedor() {
  const cpf = process.argv[2]
  
  if (!cpf) {
    console.log('Uso: node scripts/set-vendedor.js <cpf>')
    console.log('Exemplo: node scripts/set-vendedor.js 12345678901')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const client = await pool.connect()

  try {
    const result = await client.query(
      `UPDATE "user" SET "isVendedor" = TRUE WHERE cpf = $1 RETURNING id, name, email, "isVendedor"`,
      [cpf.replace(/\D/g, '')]
    )

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado com CPF:', cpf)
    } else {
      console.log('✅ Usuário marcado como vendedor:')
      console.log('   Nome:', result.rows[0].name)
      console.log('   Email:', result.rows[0].email)
      console.log('   isVendedor:', result.rows[0].isVendedor)
    }
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

setVendedor()
