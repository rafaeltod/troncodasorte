require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const raffleId = '650d8d40-8e64-445c-9eb0-7410276d2915';
  const users = [
    '79e8b9cf-7736-4abf-a35e-3d0ce07110f8',
    '522145bf-d795-4660-80da-1a3fb7e27499',
    'b7bb7a87-0854-4585-8884-4ddb1c9b0fb2',
    '5dbbea02-e210-4a46-a72f-b5a8bf6486d0'
  ];

  const usedNumbers = new Set();

  function genNumbers(count) {
    const nums = [];
    while (nums.length < count) {
      const n = Math.floor(Math.random() * 1000000);
      const formatted = String(n).padStart(6, '0');
      if (!usedNumbers.has(formatted)) {
        usedNumbers.add(formatted);
        nums.push(formatted);
      }
    }
    return nums;
  }

  let totalLivros = 0;

  for (let i = 0; i < 4; i++) {
    const livros = 10;
    const numbers = genNumbers(10);
    const numbersStr = numbers.join(',');
    const amount = livros * 0.50;
    totalLivros += livros;

    const result = await pool.query(
      `INSERT INTO livros (id, "userId", "raffleId", livros, amount, numbers, status, "statusPago", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'confirmed', true, NOW(), NOW())
       RETURNING id, "userId", livros, numbers`,
      [users[i], raffleId, livros, amount, numbersStr]
    );
    console.log('Compra ' + (i + 1) + ':', result.rows[0].id, '- User:', users[i].slice(0, 8), '- Numbers:', numbersStr);
  }

  // Update soldLivros
  await pool.query(
    `UPDATE lotes SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW() WHERE id = $2`,
    [totalLivros, raffleId]
  );
  console.log('\nTotal livros adicionados:', totalLivros);
  console.log('Done!');

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
