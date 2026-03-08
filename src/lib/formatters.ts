export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14)
}

export function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15)
}

export function removeCPFFormatting(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function removePhoneFormatting(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Censura o nome mostrando apenas primeiro nome + sobrenome + ***
 * Ex: "Rafael Ricco Teste" → "Rafael Ricco ***"
 * Ex: "Yan Alves Nobre Ribeiro" → "Yan Alves ***"
 */
export function censorName(name: string): string {
  if (!name || name.trim().length === 0) return '***'
  
  const parts = name.trim().split(' ')
  
  // Se tem menos de 2 palavras, mostrar só a primeira + ***
  if (parts.length < 2) {
    return `${parts[0]} ***`
  }
  
  // Mostrar primeiro nome + segundo nome + ***
  return `${parts[0]} ${parts[1]} ***`
}

/**
 * Censura o email mostrando apenas primeiros 4 caracteres + últimos 4 caracteres
 * Ex: "rafael@email.com" → "rafa******.com"
 * Ex: "usuario.name@empresa.com.br" → "usua******.r.br"
 */
export function censorEmail(email: string): string {
  if (!email || email.length < 8) return '****'
  
  // Primeiros 4 caracteres
  const first4 = email.substring(0, 4)
  
  // Últimos 4 caracteres
  const last4 = email.substring(email.length - 4)
  
  // Preencher com asteriscos no meio
  const middleLength = email.length - 8
  const middle = '*'.repeat(Math.max(middleLength, 4))
  
  return `${first4}${middle}${last4}`
}

/**
 * Censura o telefone mostrando DDD + dígitos do meio + **
 * Ex: "(11) 98765-4321" → "(11) 98765-**"
 * Ex: "11987654321" → "(11) 98765-**"
 */
export function censorPhone(phone: string): string {
  // Remove formatação
  const clean = phone.replace(/\D/g, '')
  
  if (clean.length < 10) return '###-####'
  
  // DDD (primeiros 2 dígitos)
  const ddd = clean.substring(0, 2)
  
  // Dígitos do meio (3º até penúltimo)
  const middle = clean.substring(2, clean.length - 2)
  
  // Formatar: (DDD) MIDDLE-**
  return `(${ddd}) ${middle}-**`
}

/**
 * Censura o telefone mostrando APENAS DDD + últimos 4 dígitos
 * Ex: "11987654321" → "(11) ****-9999"
 * Ex: "(11) 98765-4321" → "(11) ****-4321"
 */
export function censorPhoneShort(phone: string): string {
  // Remove formatação
  const clean = phone.replace(/\D/g, '')
  
  if (clean.length < 10) return '(##) ****-####'
  
  // DDD (primeiros 2 dígitos)
  const ddd = clean.substring(0, 2)
  
  // Últimos 4 dígitos
  const last4 = clean.substring(clean.length - 4)
  
  // Formatar: (DDD) ****-LAST4
  return `(${ddd}) ****-${last4}`
}

/**
 * Censura o CPF mostrando apenas últimos 4 dígitos
 * Ex: "123.456.789-00" → "***.***.***.00"
 * Ex: "12345678900" → "***.***.*00"
 */
export function censorCPF(cpf: string): string {
  // Remove formatação
  const clean = cpf.replace(/\D/g, '')
  
  if (clean.length !== 11) return '***.***.***-**'
  
  // Últimos 2 dígitos
  const last2 = clean.substring(clean.length - 2)
  
  // Formatar: ***.***.*XX-YY
  return `***.***.*${clean.substring(7, 9)}-${last2}`
}

/**
 * Formata um número como moeda brasileira (BRL)
 * Ex: 1000 → "R$ 1.000,00"
 * Ex: 50.5 → "R$ 50,50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata um número com separador de decimal em vírgula (padrão brasileiro)
 * Ex: 50.50 → "50,50"
 * Ex: 1000.00 → "1000,00"
 * Ex: 123.4 → "123,4"
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace('.', ',')
}

