import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://livrariafortuna.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Tronco da Sorte - Lotes Online com Sorteios Premiados",
    template: "%s | Tronco da Sorte",
  },
  description: "Plataforma de lotes online com sorteios premiados. Participe, compre seus livros e concorra a prêmios incríveis!",
  keywords: ["lotes online", "sorteios", "prêmios", "livros", "rifas", "tronco da sorte"],
  authors: [{ name: "Tronco da Sorte" }],
  creator: "Tronco da Sorte",
  publisher: "Tronco da Sorte",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Tronco da Sorte",
    title: "Tronco da Sorte - Lotes Online com Sorteios Premiados",
    description: "Plataforma de lotes online com sorteios premiados. Participe, compre seus livros e concorra a prêmios incríveis!",
    images: [
      {
        url: "/troncodasorte.png",
        width: 1200,
        height: 630,
        alt: "Tronco da Sorte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tronco da Sorte - Lotes Online com Sorteios Premiados",
    description: "Plataforma de lotes online com sorteios premiados. Participe, compre seus livros e concorra a prêmios incríveis!",
    images: ["/troncodasorte.png"],
  },
  verification: {
    // Adicione depois de verificar no Google Search Console
    // google: 'seu-código-de-verificação',
  },
};
