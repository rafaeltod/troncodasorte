import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Rotas públicas que não precisam de token
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/lotes', '/top-compradores']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // Se não tem token e está tentando acessar rota protegida, redireciona para home
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se tem token e está na home, vai direto para rifas
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/lotes', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Executar middleware apenas em rotas de página
     * Excluir: arquivos estáticos, _next, api, public, uploads
     */
    '/((?!_next|api|public|uploads|.*\\.[\\w]+$).)*',
  ],
}
