'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Trophy } from 'lucide-react'

interface RaffleImageGalleryProps {
  mainImage: string
  images: string[]
  status?: string
}

export function RaffleImageGallery({ mainImage, images, status }: RaffleImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : [])
  const currentImage = allImages[selectedIdx] || mainImage

  return (
    <div>
      {currentImage && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 border border-gray-200">
          <div className="relative w-full h-55 md:h-100 lg:h-125 bg-gray-100">
            <Image
              src={currentImage}
              alt={`Imagem ${selectedIdx + 1}`}
              fill
              className="object-cover"
              priority
            />
            {status === 'drawn' && (
              <div className="absolute inset-0 bg-emerald-500 bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-20 h-20 text-white mx-auto mb-2" />
                  <span className="text-white font-bold text-3xl">SORTEADA</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`bg-white rounded-lg shadow overflow-hidden border-2 transition-all ${
                selectedIdx === idx 
                  ? 'border-emerald-600 shadow-lg' 
                  : 'border-gray-200 hover:border-emerald-400'
              }`}
            >
              <div className="relative w-full h-20 bg-gray-100">
                <Image
                  src={image}
                  alt={`Imagem ${idx + 1}`}
                  fill
                  className="object-cover cursor-pointer"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
