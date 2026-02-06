import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são aceitas' },
        { status: 400 }
      )
    }

    // Criar pasta de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const fileExtension = file.type.split('/')[1] || 'jpg'
    const fileName = `${timestamp}-${random}.${fileExtension}`

    // Salvar arquivo
    const buffer = await file.arrayBuffer()
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, Buffer.from(buffer))

    // Retornar URL pública
    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({
      url: publicUrl,
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
