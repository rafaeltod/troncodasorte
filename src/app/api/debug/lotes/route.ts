import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export async function GET() {
  try {
    const raffles = await queryMany(
      `SELECT id, title, image, images, "createdAt" FROM lotes ORDER BY "createdAt" DESC LIMIT 5`
    )

    return NextResponse.json({
      total: raffles.length,
      raffles: raffles.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        images: r.images,
        imageType: typeof r.image,
        imagesType: typeof r.images,
        imagesArray: Array.isArray(r.images),
      })),
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
