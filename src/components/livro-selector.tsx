import React from 'react'

interface LivroSelectorProps {
  selectedQuantity: number
  onSelect: (quantity: number) => void
  availableLivros: number
}

export const LivroSelector: React.FC<LivroSelectorProps> = ({
  selectedQuantity,
  onSelect,
  availableLivros,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor="livro-quantity" className="block text-sm font-medium text-gray-700 mb-2">
        Quantidade de Livros
      </label>
      <input
        id="livro-quantity"
        type="number"
        min={1}
        max={availableLivros}
        value={selectedQuantity}
        onChange={e => onSelect(Number(e.target.value))}
        className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <span className="text-xs text-gray-500 mt-1 block">Disponíveis: {availableLivros}</span>
    </div>
  )
}
