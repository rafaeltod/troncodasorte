require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const raffleId = '3213f99c-b528-4887-9129-059e348338bb';
  const livroPrice = 0.01;
  const segundoPremioNumber = '647742'; // segundo prêmio aleatório

  const users = [
    { id: '79e8b9cf-7736-4abf-a35e-3d0ce07110f8', livros: 3 },
    { id: '522145bf-d795-4660-80da-1a3fb7e27499', livros: 4 },
    { id: 'b7bb7a87-0854-4585-8884-4ddb1c9b0fb2', livros: 5 },
    { id: 'dd68197b-c00f-4fbf-bd06-244b06a9391e', livros: 6 },
  ];

  const usedNumbers = new Set();
  usedNumbers.add(segundoPremioNumber);

  function genRandomNumber() {
    while (true) {
      const n = Math.floor(Math.random() * 1000000);
      const formatted = String(n).padStart(6, '0');
      if (!usedNumbers.has(formatted)) {
        usedNumbers.add(formatted);
        return formatted;
      }
    }
  }

  let totalLivros = 0;

  for (let i = 0; i < users.length; i++) {
    const { id: userId, livros } = users[i];
    const numbers = [];

    // Cada usuário tem o número do segundo prêmio aleatório + números aleatórios
    numbers.push(segundoPremioNumber);
    for (let j = 1; j < livros; j++) {
      numbers.push(genRandomNumber());
    }

    const numbersStr = numbers.join(',');
    const amount = livros * livroPrice;
    totalLivros += livros;

    const result = await pool.query(
      `INSERT INTO livros (id, "userId", "raffleId", livros, amount, numbers, status, "statusPago", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'confirmed', true, NOW(), NOW())
       RETURNING id, "userId", livros, numbers`,
      [userId, raffleId, livros, amount, numbersStr]
    );
    console.log('Compra ' + (i + 1) + ': userId=' + userId.slice(0, 8) + '... | livros=' + livros + ' | numbers=' + numbersStr);
  }

  // Update soldLivros
  await pool.query(
    `UPDATE lotes SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW() WHERE id = $2`,
    [totalLivros, raffleId]
  );

  console.log('\nTotal livros adicionados: ' + totalLivros);
  console.log('Número do 2º prêmio aleatório (647742) presente em TODAS as compras.');
  console.log('Done!');

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
