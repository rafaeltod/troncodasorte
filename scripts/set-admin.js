const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function setUserAsAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.log('❌ Por favor, forneça um email:')
    console.log('   node scripts/set-admin.js email@exemplo.com')
    process.exit(1)
  }

  try {
    console.log(`🔄 Tornando ${email} administrador...`)
    
    const result = await pool.query(
      `UPDATE "user" SET "isAdmin" = TRUE WHERE email = $1 RETURNING id, name, email, "isAdmin"`,
      [email]
    )

    if (result.rowCount === 0) {
      console.log(`❌ Usuário com email ${email} não encontrado.`)
    } else {
      console.log('✅ Usuário atualizado com sucesso!')
      console.log('\n📋 Dados do usuário:')
      console.log(result.rows[0])
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error)
  } finally {
    await pool.end()
  }
}

setUserAsAdmin()
