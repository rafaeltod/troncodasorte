import { NextResponse } from 'next/server'

// Route handler para requisições antigas de imagens em /uploads
// Retorna um placeholder SVG já que essas imagens foram convertidas para base64

export async function GET() {
  const placeholderSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#f3f4f6" width="400" height="300"/>
      <g fill="#9ca3af">
        <path d="M180 100c19.882 0 36-16.118 36-36s-16.118-36-36-36-36 16.118-36 36 16.118 36 36 36zm0-60c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24z"/>
        <path d="M360 180H40c-11.046 0-20-8.954-20-20V40c0-11.046 8.954-20 20-20h320c11.046 0 20 8.954 20 20v120c0 11.046-8.954 20-20 20zm-320-140c-5.523 0-10 4.477-10 10v120c0 5.523 4.477 10 10 10h320c5.523 0 10-4.477 10-10V40c0-5.523-4.477-10-10-10H40z"/>
        <path d="M360 260H40c-11.046 0-20-8.954-20-20v-30h20v30h320v-30h20v30c0 11.046-8.954 20-20 20z"/>
      </g>
      <text x="200" y="160" font-family="system-ui" font-size="16" fill="#6b7280" text-anchor="middle">
        Imagem indisponível
      </text>
    </svg>
  `

  return new NextResponse(placeholderSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
