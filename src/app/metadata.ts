import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tronco da Sorte",
  description: "Plataforma de ações digitais com sorteios premiados",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tronco da Sorte",
    description: "Plataforma de ações digitais com sorteios premiados",
    images: [
      {
        url: "/troncodasorte.png",
        width: 1200,
        height: 630,
        alt: "Tronco da Sorte",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tronco da Sorte",
    description: "Plataforma de ações digitais com sorteios premiados",
    images: ["/troncodasorte.png"],
  },
};
