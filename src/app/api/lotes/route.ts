import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
import { createRaffleSchema } from '@/lib/validations'

// Configuração do Route Segment para aumentar limite de body
export const maxDuration = 60 // segundos
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Pega o userId do cookie autenticado
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Tentar parsear o body com tratamento de erro
    let body
    try {
      body = await req.json()
    } catch (jsonError) {
      console.error('[CREATE RAFFLE] Error parsing JSON:', jsonError)
      return NextResponse.json(
        { error: 'Erro ao processar requisição. Verifique se os dados estão corretos.' },
        { status: 400 }
      )
    }

    // Log do body para debug
    console.log('[CREATE RAFFLE] Body received:', {
      title: body.title,
      description: body.description?.substring(0, 50),
      prizeAmount: body.prizeAmount,
      totalLivros: body.totalLivros,
      livroPrice: body.livroPrice,
      imagesCount: body.images?.length || 0,
      imageSizes: body.images?.map((img: string) => img.length) || [],
    })

    // Validate
    const validatedData = createRaffleSchema.parse(body)

    // Create raffle com o userId do token
    // Gerar número aleatório de 6 dígitos para cada prêmio aleatório na criação
    let premiosConfigWithNumbers = validatedData.premiosConfig || []
    if (premiosConfigWithNumbers.length > 0) {
      const usedNumbers = new Set<string>()
      premiosConfigWithNumbers = premiosConfigWithNumbers.map((premio) => {
        let number: string
        do {
          number = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
        } while (usedNumbers.has(number))
        usedNumbers.add(number)
        return { ...premio, number }
      })
    }
    const premiosConfigJson = premiosConfigWithNumbers.length > 0
      ? JSON.stringify(premiosConfigWithNumbers)
      : null

    const raffle = await queryOne(
      `INSERT INTO lotes (title, description, "prizeAmount", "totalLivros", "livroPrice", "creatorId", status, image, images, "qtdPremiosAleatorios", "premiosConfig", cliente, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.prizeAmount,
        validatedData.totalLivros,
        validatedData.livroPrice,
        token, // userId do token autenticado
        validatedData.images?.[0] || null,
        validatedData.images || [],
        validatedData.qtdPremiosAleatorios || 0,
        premiosConfigJson,
        body.cliente || 'troncodasorte',
      ]
    )

    // Sortear imediatamente prêmios com porcentagemSorteio === 0
    const hasPrizeToDraw0 = premiosConfigWithNumbers.some(
      (p: any) => (p.porcentagemSorteio ?? 0) === 0
    )
    if (hasPrizeToDraw0) {
      const usedDrawnNumbers = new Set<string>()
      const premiosComDraw = premiosConfigWithNumbers.map((p: any) => {
        if ((p.porcentagemSorteio ?? 0) !== 0) return p
        let drawnNumber: string
        do {
          const n = Math.floor(Math.random() * 999999) + 1
          drawnNumber = String(n).padStart(6, '0')
        } while (usedDrawnNumbers.has(drawnNumber))
        usedDrawnNumbers.add(drawnNumber)
        return { ...p, drawnNumber, number: drawnNumber }
      })
      await queryOne(
        `UPDATE lotes SET "premiosConfig" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [JSON.stringify(premiosComDraw), raffle.id]
      )
      raffle.premiosConfig = premiosComDraw
    }

    return NextResponse.json(raffle, { status: 201 })
  } catch (error) {
    console.error('Error creating raffle:', error)
    
    // Log mais detalhado do erro
    let errorMessage = 'Erro ao criar rifa'
    
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.message.includes('validation')) {
        errorMessage = error.message
      } else if (error.message.includes('query')) {
        errorMessage = 'Erro ao salvar no banco de dados'
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erro ao processar dados (imagens podem estar muito grandes)'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const cliente = req.nextUrl.searchParams.get('cliente')
    const raffles = await queryMany(
      `SELECT r.*, json_build_object('name', u.name, 'email', u.email) as creator
       FROM lotes r
       JOIN "user" u ON r."creatorId" = u.id
       ${cliente ? 'WHERE r.cliente = $1' : ''}
       ORDER BY r."createdAt" DESC`,
      cliente ? [cliente] : []
    )

    return NextResponse.json(raffles)
  } catch (error) {
    console.error('Error fetching raffles:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifas' },
      { status: 500 }
    )
  }
}