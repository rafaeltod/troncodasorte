import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
import { createRaffleSchema } from '@/lib/validations'

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

    const body = await req.json()

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
      `INSERT INTO lotes (title, description, "prizeAmount", "totalLivros", "livroPrice", "creatorId", status, image, images, "qtdPremiosAleatorios", "premiosConfig", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, $9, $10, NOW(), NOW())
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

export async function GET() {
  try {
    const raffles = await queryMany(
      `SELECT r.*, json_build_object('name', u.name, 'email', u.email) as creator
       FROM lotes r
       JOIN "user" u ON r."creatorId" = u.id
       ORDER BY r."createdAt" DESC`
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