/**
 * Formata um valor numérico para o formato de moeda brasileira (sem símbolo R$)
 * @param value - Valor em centavos ou string
 * @returns String formatada como moeda brasileira (ex: "1.234.567,89")
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0,00'
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formata um valor numérico para moeda brasileira COM símbolo R$
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrencyWithSymbol(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata o input de moeda enquanto o usuário digita
 * Remove tudo que não é número e adiciona formatação brasileira
 * @param value - Valor digitado
 * @returns Valor formatado
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  if (numbers === '') return ''
  
  // Converte para número (centavos)
  const amount = parseInt(numbers, 10)
  
  // Divide por 100 para obter o valor em reais
  const reais = amount / 100
  
  // Formata com separadores brasileiros
  return formatCurrency(reais)
}

/**
 * Converte string formatada em número para enviar ao backend
 * @param value - String formatada (ex: "1.234,56")
 * @returns Número decimal (ex: 1234.56)
 */
export function parseCurrencyInput(value: string): number {
  // Remove separadores de milhar e substitui vírgula por ponto
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Hook de input para moeda brasileira
 * Retorna valor formatado e conversões necessárias
 */
export function useCurrencyInput(initialValue: string | number = '') {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return formatCurrency(val)
    }
    return val
  }

  const handleChange = (value: string): string => {
    return formatCurrencyInput(value)
  }

  return {
    formatValue,
    handleChange,
    parseValue: parseCurrencyInput
  }
}
