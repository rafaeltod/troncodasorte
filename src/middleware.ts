import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Primeiro segmento do path
  const pathParts = pathname.slice(1).split('/')
  const firstSegment = pathParts[0]
  const secondSegment = pathParts[1] || ''

  // Segmentos reservados (rotas de sistema, não são slugs de cliente)
  const reservedTopLevel = new Set(['admin', 'auth', 'criar-lote', 'debug', 'account', 'dashboard', 'historico', 'vendedor', '_next', 'api', 'public', 'uploads'])

  // Sub-rotas de cliente que são públicas
  const clientePublicSubPaths = new Set(['lotes', 'meus-bilhetes', 'compra', 'privacidade', 'termos', 'top-compradores'])

  const isPublicRoute = (() => {
    // Raiz: redirecionar para /troncodasorte (não é pública para usuários comuns)
    if (pathname === '/') return false
    // Rotas de auth: apenas /auth/register é pública
    if (pathname === '/auth/register') return true
    if (pathname.startsWith('/auth/')) return false
    // Rotas legadas que ainda existem
    if (clientePublicSubPaths.has(firstSegment)) return true
    // Se o primeiro segmento é reservado, não é rota de cliente (vai para proteção normal)
    if (reservedTopLevel.has(firstSegment)) return false
    // /{cliente} — home do cliente é pública
    if (pathParts.length === 1) return true
    // /{cliente}/{sub} — sub públicas
    return clientePublicSubPaths.has(secondSegment)
  })()

  // Redirecionamento especial para raiz
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/troncodasorte', request.url))
  }

  // Bloquear /auth/login para usuários já logados
  if (pathname === '/auth/login' && token) {
    return NextResponse.redirect(new URL('/troncodasorte', request.url))
  }

  // Se não tem token e está tentando acessar rota protegida, redireciona para registro
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/register', request.url))
  }

  const response = NextResponse.next()

  // Desabilitar cache para páginas de lotes (dinâmicas)
  if (pathname.includes('/lotes/')) {
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
