import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://livrariafortuna.com.br'
  
  // Páginas estáticas principais
  const staticPages = [
    '',
    '/troncodasorte',
    '/troncodasorte/home',
    '/troncodasorte/auth/login',
    '/troncodasorte/auth/register',
    '/troncodasorte/termos',
    '/troncodasorte/privacidade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/troncodasorte' ? 1 : 0.8,
  }))

  // TODO: Adicionar lotes dinâmicos quando tiver acesso ao banco
  // const lotes = await fetchAllActiveLotes()
  // const lotesPages = lotes.map((lote) => ({
  //   url: `${baseUrl}/troncodasorte/lotes/${lote.id}`,
  //   lastModified: new Date(lote.updatedAt),
  //   changeFrequency: 'daily' as const,
  //   priority: 0.9,
  // }))

  return [...staticPages]
}
