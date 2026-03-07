'use client'

import Link from 'next/link'
import { mainConfig } from '../lib/layout-config'
import { Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-azul-royal flex flex-col items-center justify-center">
      <div className={`${mainConfig} flex flex-col items-center justify-center text-center py-20`}>
        <Globe className="w-20 h-20 text-amarelo-claro mb-6" />
        <h1 className="text-4xl font-black text-branco mb-4">
          Nenhum cliente selecionado
        </h1>
        <p className="text-xl text-azul-claro mb-8 max-w-md">
          Acesse um cliente específico para ver os lotes disponíveis.
        </p>
        <p className="text-branco/70 text-sm mb-8">
          Exemplo: <span className="font-mono bg-white/10 px-2 py-1 rounded text-amarelo-pastel">/troncodasorte</span>
        </p>
        <Link
          href="/troncodasorte"
          className="bg-amarelo-claro text-azul-royal font-black px-8 py-3 rounded-full text-lg hover:bg-amarelo-pastel transition"
        >
          Ir para Tronco da Sorte
        </Link>
      </div>
    </div>
  )
}
