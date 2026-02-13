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
      totalQuotas: body.totalQuotas,
      quotaPrice: body.quotaPrice,
      imagesCount: body.images?.length || 0,
      imageSizes: body.images?.map((img: string) => img.length) || [],
    })

    // Validate
    const validatedData = createRaffleSchema.parse(body)

    // Create raffle com o userId do token
    const raffle = await queryOne(
      `INSERT INTO raffle (title, description, "prizeAmount", "totalQuotas", "quotaPrice", "creatorId", status, image, images, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.prizeAmount,
        validatedData.totalQuotas,
        validatedData.quotaPrice,
        token, // userId do token autenticado
        validatedData.images?.[0] || null,
        validatedData.images || [],
      ]
    )

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
       FROM raffle r
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