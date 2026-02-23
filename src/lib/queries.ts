import { queryMany, queryOne } from '@/lib/db'

export async function getRaffles(status?: string) {
  let query = `
    SELECT 
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator
    FROM lotes r
    JOIN "user" u ON r."creatorId" = u.id
  `
  const params: any[] = []

  if (status) {
    query += ` WHERE r.status = $1`
    params.push(status)
  }

  query += ` ORDER BY r."createdAt" DESC`

  return queryMany(query, params)
}

export async function getRaffleById(id: string) {
  const query = `
    SELECT 
      r.id,
      r.title,
      r.description,
      r.image,
      r.images,
      r."prizeAmount",
      r."totalLivros",
      r."soldLivros",
      r."livroPrice",
      r.status,
      r.winner,
      r."drawnNumber",
      r."winnerNumber",
      r."qtdPremiosAleatorios",
      r."premiosAleatorios",
      r."premiosConfig",
      r."creatorId",
      r."createdAt",
      r."updatedAt",
      json_build_object('name', u.name, 'email', u.email) as creator,
      CASE WHEN r.winner IS NOT NULL 
        THEN (SELECT json_build_object('name', uw.name, 'email', uw.email) FROM "user" uw WHERE uw.id = r.winner)
        ELSE NULL
      END as "winnerUser",
      coalesce(json_agg(
        json_build_object(
          'id', rp.id,
          'userId', rp."userId",
          'raffleId', rp."raffleId",
          'livros', rp.livros,
          'amount', rp.amount,
          'numbers', rp.numbers,
          'status', rp.status,
          'createdAt', rp."createdAt",
          'user', json_build_object('name', u2.name, 'email', u2.email)
        )
      ) FILTER (WHERE rp.id IS NOT NULL), '[]'::json) as purchases
    FROM lotes r
    LEFT JOIN "user" u ON r."creatorId" = u.id
    LEFT JOIN livros rp ON r.id = rp."raffleId"
    LEFT JOIN "user" u2 ON rp."userId" = u2.id
    WHERE r.id = $1
    GROUP BY r.id, r.title, r.description, r.image, r.images, r."prizeAmount", r."totalLivros", r."soldLivros", r."livroPrice", r.status, r.winner, r."drawnNumber", r."winnerNumber", r."qtdPremiosAleatorios", r."premiosAleatorios", r."premiosConfig", r."creatorId", r."createdAt", r."updatedAt", u.name, u.email
  `

  return queryOne(query, [id])
}

export async function getUserRaffles(userId: string) {
  const query = `
    SELECT 
      r.*,
      coalesce(json_agg(
        json_build_object(
          'id', rp.id,
          'userId', rp."userId",
          'raffleId', rp."raffleId",
          'livros', rp.livros,
          'amount', rp.amount,
          'numbers', rp.numbers,
          'status', rp.status
        )
      ) FILTER (WHERE rp.id IS NOT NULL), '[]'::json) as purchases
    FROM lotes r
    LEFT JOIN livros rp ON r.id = rp."raffleId"
    WHERE r."creatorId" = $1
    GROUP BY r.id
    ORDER BY r."createdAt" DESC
  `

  return queryMany(query, [userId])
}

export async function getUserPurchases(userId: string) {
  const query = `
    SELECT 
      rp.*,
      json_build_object('title', r.title, 'status', r.status, 'winner', r.winner) as raffle
    FROM livros rp
    JOIN lotes r ON rp."raffleId" = r.id
    WHERE rp."userId" = $1
    ORDER BY rp."createdAt" DESC
  `

  return queryMany(query, [userId])
}

export async function getTopBuyers(limit = 5) {
  const query = `
    SELECT *
    FROM "topBuyer"
    ORDER BY "totalSpent" DESC
    LIMIT $1
  `

  return queryMany(query, [limit])
}

// Rifas que o usuário criou
export async function getUserCreatedRaffles(userId: string) {
  const query = `
    SELECT 
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator
    FROM lotes r
    JOIN "user" u ON r."creatorId" = u.id
    WHERE r."creatorId" = $1
    ORDER BY r."createdAt" DESC
  `

  return queryMany(query, [userId])
}

// Rifas que o usuário está participando (em andamento)
export async function getUserParticipatingRaffles(userId: string) {
  const query = `
    SELECT DISTINCT
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator,
      (SELECT COALESCE(SUM(livros), 0) FROM livros WHERE "raffleId" = r.id AND "userId" = $1) as userLivros
    FROM lotes r
    JOIN "user" u ON r."creatorId" = u.id
    JOIN livros rp ON r.id = rp."raffleId"
    WHERE rp."userId" = $1 AND r.status = 'open'
    ORDER BY r."createdAt" DESC
  `

  return queryMany(query, [userId])
}

// Rifas que o usuário já participou (finalizadas)
export async function getUserFinishedRaffles(userId: string) {
  const query = `
    SELECT DISTINCT
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator,
      (SELECT COALESCE(SUM(livros), 0) FROM livros WHERE "raffleId" = r.id AND "userId" = $1) as userLivros
    FROM lotes r
    JOIN "user" u ON r."creatorId" = u.id
    JOIN livros rp ON r.id = rp."raffleId"
    WHERE rp."userId" = $1 AND r.status != 'open'
    ORDER BY r."createdAt" DESC
  `

  return queryMany(query, [userId])
}

// Rifas disponíveis (de outros usuários, com status open)
export async function getAvailableRaffles(userId: string) {
  const query = `
    SELECT 
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator
    FROM lotes r
    JOIN "user" u ON r."creatorId" = u.id
    WHERE r."creatorId" != $1 AND r.status = 'open'
    ORDER BY r."createdAt" DESC
  `

  return queryMany(query, [userId])
}
