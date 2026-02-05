'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ onImagesChange, maxImages = 20 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= maxImages) {
      alert(`Máximo de ${maxImages} imagens atingido`)
      return
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > 5) {
      alert(`Imagem muito grande (${fileSizeMB.toFixed(2)}MB). Máximo: 5MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const newImages = [...images, base64]
      setImages(newImages)
      onImagesChange(newImages)
    }
    reader.onerror = () => {
      alert('Erro ao ler a imagem. Tente novamente.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-900 font-bold text-lg mb-3">
          📸 Fotos da Rifa ({images.length}/{maxImages})
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleAddImage}
            disabled={images.length >= maxImages}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl px-5 py-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition cursor-pointer hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-500 text-center">
              <div className="text-3xl mb-2">📁</div>
              <div className="text-sm font-semibold">Clique para selecionar uma imagem</div>
            </span>
          </div>
        </div>
        <p className="text-slate-600 text-sm mt-2">
          Máximo de {maxImages} imagens. Limite: 5MB por imagem. Formatos: JPG, PNG, GIF
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-slate-900 font-semibold mb-3">✅ {images.length} imagem(ns) adicionada(s)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Preview ${index}`} 
                  className="w-full h-24 object-cover rounded-lg shadow-md" 
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition transform hover:scale-110 shadow-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
