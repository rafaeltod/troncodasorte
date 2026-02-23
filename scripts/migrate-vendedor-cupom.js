const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const client = await pool.connect()

  try {
    console.log('🚀 Iniciando migração: Sistema de Vendedores e Cupons...\n')

    // 1. isVendedor no user
    console.log('1️⃣ Adicionando coluna isVendedor na tabela user...')
    await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isVendedor" BOOLEAN DEFAULT FALSE`)
    console.log('   ✅ Coluna isVendedor adicionada\n')

    // 2. Tabela cupom
    console.log('2️⃣ Criando tabela cupom...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS cupom (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        desconto DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "tipoDesconto" VARCHAR(20) NOT NULL DEFAULT 'percentual',
        "vendedorId" UUID NOT NULL REFERENCES "user"(id),
        "loteId" UUID REFERENCES lotes(id) ON DELETE SET NULL,
        ativo BOOLEAN DEFAULT TRUE,
        comissao DECIMAL(5, 2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✅ Tabela cupom criada\n')

    // 3. Tabela cupom_acesso
    console.log('3️⃣ Criando tabela cupom_acesso...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS cupom_acesso (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cupomId" UUID NOT NULL REFERENCES cupom(id) ON DELETE CASCADE,
        ip VARCHAR(45),
        "userAgent" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✅ Tabela cupom_acesso criada\n')

    // 4. cupomId na tabela livros
    console.log('4️⃣ Adicionando coluna cupomId na tabela livros...')
    await client.query(`ALTER TABLE livros ADD COLUMN IF NOT EXISTS "cupomId" UUID REFERENCES cupom(id) ON DELETE SET NULL`)
    console.log('   ✅ Coluna cupomId adicionada\n')

    // 5. descontoAplicado na tabela livros
    console.log('5️⃣ Adicionando coluna descontoAplicado na tabela livros...')
    await client.query(`ALTER TABLE livros ADD COLUMN IF NOT EXISTS "descontoAplicado" DECIMAL(10, 2) DEFAULT 0`)
    console.log('   ✅ Coluna descontoAplicado adicionada\n')

    // 6. Índices
    console.log('6️⃣ Criando índices...')
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cupom_vendedor ON cupom("vendedorId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cupom_code ON cupom(code)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cupom_lote ON cupom(COALESCE("loteId", '00000000-0000-0000-0000-000000000000'))`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cupom_acesso_cupom ON cupom_acesso("cupomId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_livros_cupom ON livros("cupomId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_isvendedor ON "user"("isVendedor")`)
    console.log('   ✅ Índices criados\n')

    console.log('🎉 Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro na migração:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('Falha na migração:', err)
  process.exit(1)
})
