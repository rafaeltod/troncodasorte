import { queryMany, queryOne } from '@/lib/db'

export async function getRaffles(status?: string) {
  let query = `
    SELECT 
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator
    FROM raffle r
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
      r.*,
      json_build_object('name', u.name, 'email', u.email) as creator,
      coalesce(json_agg(
        json_build_object(
          'id', rp.id,
          'userId', rp."userId",
          'raffleId', rp."raffleId",
          'quotas', rp.quotas,
          'amount', rp.amount,
          'numbers', rp.numbers,
          'status', rp.status,
          'createdAt', rp."createdAt",
          'user', json_build_object('name', u2.name, 'email', u2.email)
        )
      ) FILTER (WHERE rp.id IS NOT NULL), '[]'::json) as purchases
    FROM raffle r
    LEFT JOIN "user" u ON r."creatorId" = u.id
    LEFT JOIN "rafflePurchase" rp ON r.id = rp."raffleId"
    LEFT JOIN "user" u2 ON rp."userId" = u2.id
    WHERE r.id = $1
    GROUP BY r.id, u.id
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
          'quotas', rp.quotas,
          'amount', rp.amount,
          'numbers', rp.numbers,
          'status', rp.status
        )
      ) FILTER (WHERE rp.id IS NOT NULL), '[]'::json) as purchases
    FROM raffle r
    LEFT JOIN "rafflePurchase" rp ON r.id = rp."raffleId"
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
    FROM "rafflePurchase" rp
    JOIN raffle r ON rp."raffleId" = r.id
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
