'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RaffleImageGalleryProps {
  mainImage: string
  images: string[]
  status?: string
}

export function RaffleImageGallery({ mainImage, images, status }: RaffleImageGalleryProps) {
  const [idx, setIdx] = useState(0)
  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : [])
  const total = allImages.length
  const current = allImages[idx] || mainImage

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  if (!current) return null

  return (
    <div className="relative bg-branco rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="relative w-full h-64 md:h-96 bg-gray-100">
        <Image
          src={current}
          alt={`Imagem ${idx + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {total > 1 && (
        <>
          {/* Setas */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-branco/80 hover:bg-branco text-cinza-escuro rounded-full p-2 shadow transition z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-branco/80 hover:bg-branco text-cinza-escuro rounded-full p-2 shadow transition z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pontos */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${
                  i === idx ? 'w-4 h-2 bg-branco' : 'w-2 h-2 bg-branco/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
