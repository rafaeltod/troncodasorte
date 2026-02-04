import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  
  const protectedRoutes = ['/historico', '/criar-rifa', '/account', '/top-compradores']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/historico/:path*', '/criar-rifa/:path*', '/account/:path*', '/top-compradores/:path*'],
}
