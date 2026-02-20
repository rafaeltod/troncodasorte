'use client'

interface LivroSelectorProps {
  onSelect: (quantity: number) => void
  selectedQuantity: number
  availableLivros: number
}

export function LivroSelector({ onSelect, selectedQuantity, availableLivros }: LivroSelectorProps) {
  const presetOptions = [1, 50, 100, 200, 300, 500]

  const handleAddQuantity = (quantity: number) => {
    const newTotal = selectedQuantity + quantity
    if (newTotal <= availableLivros) {
      onSelect(newTotal)
    }
  }

  return (
    <div className="bg-branco rounded-2xl">
      <h3 className="text-1xl md:text-2xl font-black text-gray-900 mb-6">Selecione a quantidade</h3>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {presetOptions.map((quantity) => {
          const newTotal = selectedQuantity + quantity
          const isDisabled = newTotal > availableLivros
          return (
            <button
              key={quantity}
              onClick={() => !isDisabled && handleAddQuantity(quantity)}
              disabled={isDisabled}
              className={`py-2 px-1 rounded-xl font-bold cursor-pointer text-lg transition transform ${
                isDisabled
                  ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                  : 'bg-azul-pastel text-azul-royal hover:bg-azul-claro hover:scale-105'
              }`}
            >
              +{quantity}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        <p className="text-1xl md:text-2xl font-bold text-gray-900">Ou digite abaixo:</p>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
          <input
            type="number"
            min="1"
            max={availableLivros}
            value={selectedQuantity}
            onChange={(e) => onSelect(Number(e.target.value) || 1)}
            className="flex-1 text-center text-2xl font-black text-gray-900 bg-transparent border-0 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
