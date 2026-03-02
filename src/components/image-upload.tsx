'use client'

import { useState, useEffect } from 'react'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  initialImages?: string[]
}

export function ImageUpload({ onImagesChange, maxImages = 20, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)

  // Sincronizar com initialImages quando mudar
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages)
    }
  }, [initialImages])

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Erro ao fazer upload: ${errorData.error || 'Erro desconhecido'}`)
        return
      }

      const data = await response.json()
      const newImages = [...images, data.url]
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
      // Limpar input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-cinza-escuro dark:text-cinza-claro font-bold text-lg mb-3">
          Imagens ({images.length}/{maxImages})
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleAddImage}
            disabled={images.length >= maxImages || uploading}
            className="w-full border-2 border-dashed border-cinza dark:border-gray-600 rounded-xl px-5 py-8 text-cinza-escuro dark:text-cinza-claro dark:bg-[#1a2332] placeholder-cinza dark:placeholder-gray-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300/50 transition cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-500 dark:text-gray-400 text-center">
              <div className="text-3xl mb-2">{uploading ? '⏳' : '📁'}</div>
              <div className="text-sm font-semibold dark:text-gray-300">
                {uploading ? 'Fazendo upload...' : 'Clique para selecionar uma imagem'}
              </div>
            </span>
          </div>
        </div>
        <p className="text-cinza dark:text-gray-300 text-sm mt-2">
          Máximo de {maxImages} imagens. Limite: 5MB por imagem. Formatos: JPG, PNG, GIF
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-cinza-escuro dark:text-cinza-claro font-semibold mb-3">{images.length} imagem(ns) adicionada(s)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Preview ${index}`} 
                  className="w-full h-24 object-cover rounded-lg shadow-md" 
                  onError={(e) => {
                    console.error(`Erro ao carregar imagem ${index}:`, image)
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" font-size="14" fill="%23999"%3EErro%3C/text%3E%3C/svg%3E'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-vermelho-vivo text-branco rounded-full w-8 h-8 pb-1.25 max-h-8 mb-1 flex items-center justify-center font-bold transition transform hover:scale-110 shadow-lg"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
