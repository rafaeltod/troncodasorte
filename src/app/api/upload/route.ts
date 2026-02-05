import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Converter arquivo para base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Por enquanto, vou retornar um objeto simulado
    // Você pode integrar com ImageKit.io mais tarde
    return NextResponse.json({
      url: dataURI,
      fileName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
}
