'use client'

import Image from 'next/image'
import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react'

interface RaffleImageGalleryProps {
  mainImage: string
  images: string[]
  status?: string
}

export function RaffleImageGallery({ mainImage, images, status }: RaffleImageGalleryProps) {
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Lightbox state
  const [lbZoom, setLbZoom] = useState(1)
  const [lbOffset, setLbOffset] = useState({ x: 0, y: 0 })
  const lbDragging = useRef(false)
  const lbDragStart = useRef({ x: 0, y: 0 })
  const lbOffsetStart = useRef({ x: 0, y: 0 })
  // Pinch-to-zoom
  const lastPinchDist = useRef<number | null>(null)
  const lastPinchZoom = useRef(1)

  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : [])
  const total = allImages.length
  const current = allImages[idx] || mainImage

  const openLightbox = () => {
    setLbZoom(1)
    setLbOffset({ x: 0, y: 0 })
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLbZoom(1)
    setLbOffset({ x: 0, y: 0 })
  }

  const lbPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIdx(i => (i - 1 + total) % total)
    setLbZoom(1)
    setLbOffset({ x: 0, y: 0 })
  }

  const lbNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIdx(i => (i + 1) % total)
    setLbZoom(1)
    setLbOffset({ x: 0, y: 0 })
  }

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 6)

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lbPrev()
      if (e.key === 'ArrowRight') lbNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, total])

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    setLbZoom(z => {
      const next = clampZoom(z + delta)
      if (next === 1) setLbOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  // Pointer drag
  const handleLbPointerDown = useCallback((e: React.PointerEvent) => {
    lbDragging.current = true
    lbDragStart.current = { x: e.clientX, y: e.clientY }
    lbOffsetStart.current = lbOffset
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [lbOffset])

  const handleLbPointerMove = useCallback((e: React.PointerEvent) => {
    if (!lbDragging.current || lbZoom <= 1) return
    const dx = e.clientX - lbDragStart.current.x
    const dy = e.clientY - lbDragStart.current.y
    setLbOffset({ x: lbOffsetStart.current.x + dx, y: lbOffsetStart.current.y + dy })
  }, [lbZoom])

  const handleLbPointerUp = useCallback(() => {
    lbDragging.current = false
  }, [])

  // Touch pinch-to-zoom + drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
      lastPinchZoom.current = lbZoom
    } else if (e.touches.length === 1) {
      lbDragging.current = true
      lbDragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lbOffsetStart.current = lbOffset
    }
  }, [lbZoom, lbOffset])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      if (lastPinchDist.current !== null) {
        const scale = dist / lastPinchDist.current
        const nextZoom = clampZoom(lastPinchZoom.current * scale)
        setLbZoom(nextZoom)
        if (nextZoom === 1) setLbOffset({ x: 0, y: 0 })
      }
    } else if (e.touches.length === 1 && lbDragging.current && lbZoom > 1) {
      const dx = e.touches[0].clientX - lbDragStart.current.x
      const dy = e.touches[0].clientY - lbDragStart.current.y
      setLbOffset({ x: lbOffsetStart.current.x + dx, y: lbOffsetStart.current.y + dy })
    }
  }, [lbZoom])

  const handleTouchEnd = useCallback(() => {
    lbDragging.current = false
    lastPinchDist.current = null
  }, [])

  if (!current) return null

  return (
    <>
      {/* Thumbnail / Card */}
      <div className="flex flex-col gap-2">
        <div className="relative bg-branco rounded-2xl shadow-lg overflow-hidden border border-gray-200 group cursor-zoom-in" onClick={openLightbox}>
          <div className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden select-none">
            <Image
              src={current}
              alt={`Imagem ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
              draggable={false}
            />
            {/* Hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-3">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer bg-black/60 text-white rounded-full p-2 shadow transition z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % total) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-black/60 text-white rounded-full p-2 shadow transition z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setIdx(i) }}
                    className={`rounded-full transition-all ${i === idx ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => { const z = clampZoom(lbZoom - 0.5); setLbZoom(z); if (z === 1) setLbOffset({ x: 0, y: 0 }) }} className="text-white/70 hover:text-white cursor-pointer transition">
              <ZoomOut className="w-5 h-5" />
            </button>
            <input
              type="range" min="1" max="6" step="0.1"
              value={lbZoom}
              onChange={e => { const z = clampZoom(parseFloat(e.target.value)); setLbZoom(z); if (z === 1) setLbOffset({ x: 0, y: 0 }) }}
              className="w-32 h-1.5 appearance-none rounded-full bg-white/30 cursor-pointer accent-yellow-400"
            />
            <button onClick={() => setLbZoom(z => clampZoom(z + 0.5))} className="text-white/70 hover:text-white cursor-pointer transition">
              <ZoomIn className="w-5 h-5" />
            </button>
            <span className="text-white/60 text-xs font-mono w-10 text-right">{Math.round(lbZoom * 100)}%</span>
          </div>

          {/* Navigation */}
          {total > 1 && (
            <>
              <button
                onClick={lbPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={lbNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white/60 text-sm font-mono">
                {idx + 1} / {total}
              </div>
            </>
          )}

          {/* Image container */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ cursor: lbZoom > 1 ? 'grab' : 'zoom-in' }}
            onClick={e => {
              if (lbZoom === 1) {
                setLbZoom(2)
              } else {
                e.stopPropagation()
              }
            }}
            onWheel={handleWheel}
            onPointerDown={handleLbPointerDown}
            onPointerMove={handleLbPointerMove}
            onPointerUp={handleLbPointerUp}
            onPointerCancel={handleLbPointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                transform: `scale(${lbZoom}) translate(${lbOffset.x / lbZoom}px, ${lbOffset.y / lbZoom}px)`,
                transition: lbDragging.current ? 'none' : 'transform 0.15s ease',
                position: 'relative',
                width: '90vw',
                height: '85vh',
              }}
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={current}
                alt={`Imagem ${idx + 1}`}
                fill
                className="object-contain"
                draggable={false}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
