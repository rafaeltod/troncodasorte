'use client'

import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface RaffleImageGalleryProps {
  mainImage: string
  images: string[]
  status?: string
}

export function RaffleImageGallery({ mainImage, images, status }: RaffleImageGalleryProps) {
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })
  const offsetStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : [])
  const total = allImages.length
  const current = allImages[idx] || mainImage

  const prev = () => { setIdx(i => (i - 1 + total) % total); resetZoom() }
  const next = () => { setIdx(i => (i + 1) % total); resetZoom() }

  const resetZoom = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 1), 4)
    if (clamped === 1) {
      setOffset({ x: 0, y: 0 })
    }
    setZoom(clamped)
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    offsetStart.current = { ...offset }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [zoom, offset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || zoom <= 1) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    })
  }, [dragging, zoom])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  if (!current) return null

  return (
  return (
    <div className="flex flex-col gap-2">
      {/* Imagem */}
      <div className="relative bg-branco rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div
          ref={containerRef}
          className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden select-none"
          style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Image
            src={current}
            alt={`Imagem ${idx + 1}`}
            fill
            className="object-cover transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            }}
            priority
            draggable={false}
          />
        </div>

        {total > 1 && (
          <>
            {/* Setas */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer bg-preto/80 text-branco rounded-full p-2 shadow transition z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-preto/80 text-branco rounded-full p-2 shadow transition z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pontos */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIdx(i); resetZoom() }}
                  className={`rounded-full transition-all ${
                    i === idx ? 'w-4 h-2 bg-branco' : 'w-2 h-2 bg-branco/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Barra de Zoom */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-cinza-escuro rounded-xl shadow">
        <ZoomOut className="w-4 h-4 text-branco/70 shrink-0" />
        <input
          type="range"
          min="1"
          max="4"
          step="0.1"
          value={zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 appearance-none rounded-full bg-branco/30 cursor-pointer accent-amarelo-gold
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amarelo-gold [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amarelo-gold [&::-moz-range-thumb]:border-0"
        />
        <ZoomIn className="w-4 h-4 text-branco/70 shrink-0" />
        <span className="text-xs text-branco/70 font-mono w-10 text-right">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
