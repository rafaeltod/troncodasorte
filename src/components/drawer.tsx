'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      {/* Overlay - somente no desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 hidden md:block transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-[500px] 
                     bg-white z-50 flex flex-col
                     rounded-t-3xl md:rounded-none
                     transition-all duration-300 ease-out
                     ${
                       isOpen
                         ? 'translate-y-0 md:translate-x-0'
                         : 'translate-y-full md:translate-x-full'
                     }
                     shadow-2xl md:shadow-2xl
                    `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl md:rounded-none z-10">
          {title && (
            <h2 className="text-lg font-bold text-gray-900 flex-1">{title}</h2>
          )}
          {!title && <div className="flex-1" />}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fechar"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </>
  )
}
