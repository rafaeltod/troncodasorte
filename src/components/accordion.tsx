'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-cinza-claro rounded-lg overflow-hidden ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center cursor-pointer justify-between p-4 bg-fundo-cinza hover:bg-azul-pastel transition-colors"
      >
        <span className="text-lg font-bold text-cinza">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-cinza-claro transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-branco border-t border-cinza-claro">
          {children}
        </div>
      )}
    </div>
  )
}
