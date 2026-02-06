import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const publicRoutes = ['/', '/auth/login', '/auth/register', '/rifas', '/top-compradores']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')) || request.nextUrl.pathname.startsWith('/uploads/')

  // Se não tem token e está tentando acessar rota protegida, redireciona para home
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se tem token e está na home, vai direto para rifas
  if (token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/rifas', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|public|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)'],
}
