require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const raffleId = '9e16440a-1e28-4e46-9eab-267cd326e804';

const buyers = [
  { name: 'Lucas Silva', cpf: '12345678901', email: 'lucas.silva@email.com', phone: '11987654321' },
  { name: 'Maria Oliveira', cpf: '23456789012', email: 'maria.oliveira@email.com', phone: '21976543210' },
  { name: 'João Santos', cpf: '34567890123', email: 'joao.santos@email.com', phone: '31965432109' },
  { name: 'Ana Costa', cpf: '45678901234', email: 'ana.costa@email.com', phone: '41954321098' },
  { name: 'Pedro Souza', cpf: '56789012345', email: 'pedro.souza@email.com', phone: '51943210987' },
  { name: 'Beatriz Lima', cpf: '67890123456', email: 'beatriz.lima@email.com', phone: '61932109876' },
  { name: 'Carlos Pereira', cpf: '78901234567', email: 'carlos.pereira@email.com', phone: '71921098765' },
  { name: 'Fernanda Almeida', cpf: '89012345678', email: 'fernanda.almeida@email.com', phone: '81910987654' },
  { name: 'Rafael Rodrigues', cpf: '90123456789', email: 'rafael.rodrigues@email.com', phone: '91909876543' },
  { name: 'Juliana Ferreira', cpf: '01234567890', email: 'juliana.ferreira@email.com', phone: '85998765432' },
];

const usedNumbers = new Set();

function genNumbers(count) {
  const nums = [];
  while (nums.length < count) {
    const n = Math.floor(Math.random() * 999999) + 1;
    const formatted = String(n).padStart(6, '0');
    if (!usedNumbers.has(formatted)) {
      usedNumbers.add(formatted);
      nums.push(formatted);
    }
  }
  return nums;
}

async function main() {
  console.log('Conectando ao banco...');
  const client = await pool.connect();
  console.log('Conectado! Iniciando transacao...');
  try {
    await client.query('BEGIN');

    let totalLivros = 0;

    for (let i = 0; i < buyers.length; i++) {
      const b = buyers[i];
      const daysAgo = 10 - i;

      console.log('Inserindo user: ' + b.name + ' cpf=' + b.cpf);

      // Create user - unique on cpf, email, phone so use unique values
      const userSql = 'INSERT INTO "user" (id, cpf, name, email, phone, "birthDate", "phoneConfirmed", "acceptedTerms", "createdAt", "updatedAt", "isAdmin", "isVendedor") VALUES (gen_random_uuid(), $1, $2, $3, $4, \'1995-01-01\', true, true, NOW() - interval \'' + daysAgo + ' days\', NOW(), false, false) ON CONFLICT (cpf) DO UPDATE SET name = EXCLUDED.name RETURNING id';
      const userRes = await client.query(userSql, [b.cpf, b.name, b.email, b.phone]);
      const userId = userRes.rows[0].id;
      console.log('  User ID: ' + userId);

      // Create purchase with 10 numbers, status confirmed
      const livros = 10;
      const numbers = genNumbers(10);
      const numbersStr = numbers.join(',');
      const amount = livros * 0.50;
      const paymentId = 'PIX' + Date.now() + '' + i;

      const purchaseSql = 'INSERT INTO livros (id, "userId", "raffleId", livros, amount, numbers, status, "statusPago", phone, payment_id, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, \'confirmed\', true, $6, $7, NOW() - interval \'' + daysAgo + ' days\', NOW()) RETURNING id';
      const purchaseRes = await client.query(purchaseSql, [userId, raffleId, livros, amount, numbersStr, b.phone, paymentId]);

      totalLivros += livros;
      console.log('  Compra criada: ' + purchaseRes.rows[0].id + ' | payment_id: ' + paymentId);
    }

    // Update soldLivros on the lote
    await client.query(
      'UPDATE lotes SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW() WHERE id = $2',
      [totalLivros, raffleId]
    );

    await client.query('COMMIT');
    console.log('\nTotal: ' + totalLivros + ' livros vendidos para ' + buyers.length + ' compradores');
    console.log('Lote do ar condicionado atualizado com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERRO:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
