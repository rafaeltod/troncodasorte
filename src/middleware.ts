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

  // Usuário logado na home: deixar acessar normalmente (a home já lista os lotes)

  const response = NextResponse.next()

  // ✅ Desabilitar cache completamente para página de lotes (dinâmica)
  if (pathname.startsWith('/lotes/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
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
