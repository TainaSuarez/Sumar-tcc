/**
 * Utilidades para validación de tarjetas de crédito/débito
 * Incluye validación de Luhn, detección de banderas, y más
 */

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'unionpay'
  | 'maestro'
  | 'elo'
  | 'hipercard'
  | 'unknown';

export type CardType = 'credit' | 'debit' | 'prepaid' | 'unknown';

export interface CardBrandInfo {
  brand: CardBrand;
  displayName: string;
  lengths: number[];
  cvvLength: number;
  luhnCheck: boolean;
  pattern: RegExp;
  color: string;
  logo?: string;
}

export interface CardValidationResult {
  isValid: boolean;
  brand: CardBrand;
  brandInfo: CardBrandInfo;
  type: CardType;
  message?: string;
}

// Patrones para detectar diferentes banderas de tarjetas
const CARD_PATTERNS: Record<CardBrand, CardBrandInfo> = {
  visa: {
    brand: 'visa',
    displayName: 'Visa',
    lengths: [13, 16, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^4[0-9]{0,}$/,
    color: '#1A1F71',
  },
  mastercard: {
    brand: 'mastercard',
    displayName: 'Mastercard',
    lengths: [16],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$/,
    color: '#EB001B',
  },
  amex: {
    brand: 'amex',
    displayName: 'American Express',
    lengths: [15],
    cvvLength: 4,
    luhnCheck: true,
    pattern: /^3[47][0-9]{0,}$/,
    color: '#006FCF',
  },
  discover: {
    brand: 'discover',
    displayName: 'Discover',
    lengths: [16, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(6011|65|64[4-9]|622)[0-9]{0,}$/,
    color: '#FF6000',
  },
  diners: {
    brand: 'diners',
    displayName: 'Diners Club',
    lengths: [14, 16, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(36|38|30[0-5])[0-9]{0,}$/,
    color: '#0079BE',
  },
  jcb: {
    brand: 'jcb',
    displayName: 'JCB',
    lengths: [16, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^35[0-9]{0,}$/,
    color: '#0E4C96',
  },
  unionpay: {
    brand: 'unionpay',
    displayName: 'UnionPay',
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    luhnCheck: false,
    pattern: /^(62|88)[0-9]{0,}$/,
    color: '#E21836',
  },
  maestro: {
    brand: 'maestro',
    displayName: 'Maestro',
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(5018|5020|5038|5893|6304|6759|6761|6762|6763)[0-9]{0,}$/,
    color: '#0099DF',
  },
  elo: {
    brand: 'elo',
    displayName: 'Elo',
    lengths: [16],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6504|6505|6516)[0-9]{0,}$/,
    color: '#FFCB05',
  },
  hipercard: {
    brand: 'hipercard',
    displayName: 'Hipercard',
    lengths: [16],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^(606282|384100|384140|384160)[0-9]{0,}$/,
    color: '#D7001F',
  },
  unknown: {
    brand: 'unknown',
    displayName: 'Desconocida',
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^[0-9]{0,}$/,
    color: '#6B7280',
  },
};

/**
 * Implementación del algoritmo de Luhn para validar números de tarjeta
 * @param cardNumber - Número de tarjeta sin espacios
 * @returns true si el número es válido según Luhn
 */
export function luhnCheck(cardNumber: string): boolean {
  // Remover espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Debe ser solo números
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // El algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  // Iterar de derecha a izquierda
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detecta la bandera de la tarjeta basándose en el número
 * @param cardNumber - Número de tarjeta (puede incluir espacios)
 * @returns Información de la bandera detectada
 */
export function detectCardBrand(cardNumber: string): CardBrandInfo {
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  if (!cleaned) {
    return CARD_PATTERNS.unknown;
  }

  // Intentar detectar por patrones (orden específico para evitar conflictos)
  const detectionOrder: CardBrand[] = [
    'amex',
    'diners',
    'discover',
    'jcb',
    'maestro',
    'elo',
    'hipercard',
    'mastercard',
    'visa',
    'unionpay',
  ];

  for (const brand of detectionOrder) {
    const brandInfo = CARD_PATTERNS[brand];
    if (brandInfo.pattern.test(cleaned)) {
      return brandInfo;
    }
  }

  return CARD_PATTERNS.unknown;
}

/**
 * Valida completamente un número de tarjeta
 * @param cardNumber - Número de tarjeta
 * @returns Resultado de la validación
 */
export function validateCardNumber(cardNumber: string): CardValidationResult {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const brandInfo = detectCardBrand(cleaned);

  // Validación básica de longitud
  if (!brandInfo.lengths.includes(cleaned.length)) {
    return {
      isValid: false,
      brand: brandInfo.brand,
      brandInfo,
      type: 'unknown',
      message: `El número debe tener ${brandInfo.lengths.join(' o ')} dígitos`,
    };
  }

  // Validación de Luhn (si aplica)
  if (brandInfo.luhnCheck && !luhnCheck(cleaned)) {
    return {
      isValid: false,
      brand: brandInfo.brand,
      brandInfo,
      type: 'unknown',
      message: 'Número de tarjeta inválido',
    };
  }

  // Determinar tipo (crédito/débito) - Esta es una aproximación simple
  // En producción real, necesitarías una API de BIN lookup
  const type = detectCardType(cleaned, brandInfo.brand);

  return {
    isValid: true,
    brand: brandInfo.brand,
    brandInfo,
    type,
  };
}

/**
 * Detecta si la tarjeta es de crédito o débito
 * Nota: Esto es una aproximación. En producción, usa una API de BIN lookup
 * @param cardNumber - Número de tarjeta limpio
 * @param brand - Bandera detectada
 * @returns Tipo de tarjeta
 */
function detectCardType(cardNumber: string, brand: CardBrand): CardType {
  // Patrones comunes para débito (esto es simplificado)
  // Maestro típicamente es débito
  if (brand === 'maestro') {
    return 'debit';
  }

  // Algunas banderas específicas de débito
  const debitPatterns = [
    /^4[0-9]{3}[0-9]{2}[0-9]{10}$/, // Algunos Visa débito
  ];

  for (const pattern of debitPatterns) {
    if (pattern.test(cardNumber)) {
      return 'debit';
    }
  }

  // Por defecto, asumimos crédito para la mayoría
  // En producción, usa una API de BIN lookup real
  return 'credit';
}

/**
 * Valida la fecha de expiración
 * @param month - Mes (1-12 o "01"-"12")
 * @param year - Año (YY o YYYY)
 * @returns true si la fecha es válida y futura
 */
export function validateExpiryDate(month: string | number, year: string | number): {
  isValid: boolean;
  message?: string;
} {
  const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
  let yearNum = typeof year === 'string' ? parseInt(year, 10) : year;

  // Validar mes
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return { isValid: false, message: 'Mes inválido' };
  }

  // Convertir año de 2 dígitos a 4 dígitos
  if (yearNum < 100) {
    yearNum += 2000;
  }

  // Validar año razonable (no más de 20 años en el futuro)
  const currentYear = new Date().getFullYear();
  if (yearNum < currentYear || yearNum > currentYear + 20) {
    return { isValid: false, message: 'Año inválido' };
  }

  // Comparar con fecha actual
  const expiryDate = new Date(yearNum, monthNum - 1, 1);
  const currentDate = new Date();
  currentDate.setDate(1); // Primer día del mes actual
  currentDate.setHours(0, 0, 0, 0);

  if (expiryDate < currentDate) {
    return { isValid: false, message: 'Tarjeta expirada' };
  }

  return { isValid: true };
}

/**
 * Valida el CVV según la bandera de la tarjeta
 * @param cvv - Código de seguridad
 * @param brand - Bandera de la tarjeta
 * @returns true si el CVV es válido
 */
export function validateCVV(cvv: string, brand: CardBrand = 'unknown'): {
  isValid: boolean;
  message?: string;
} {
  const brandInfo = CARD_PATTERNS[brand];
  const expectedLength = brandInfo.cvvLength;

  if (!/^\d+$/.test(cvv)) {
    return { isValid: false, message: 'Solo se permiten números' };
  }

  if (cvv.length !== expectedLength) {
    return {
      isValid: false,
      message: `CVV debe tener ${expectedLength} dígitos para ${brandInfo.displayName}`
    };
  }

  return { isValid: true };
}

/**
 * Formatea el número de tarjeta con espacios
 * @param cardNumber - Número de tarjeta
 * @returns Número formateado
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const brandInfo = detectCardBrand(cleaned);

  // American Express usa formato diferente (4-6-5)
  if (brandInfo.brand === 'amex') {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
  }

  // Otros formatos estándar (4-4-4-4 o variaciones)
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Formatea la fecha de expiración
 * @param value - Valor de entrada
 * @returns Fecha formateada MM/YY
 */
export function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }

  return cleaned;
}

/**
 * Obtiene información de una bandera específica
 * @param brand - Bandera de la tarjeta
 * @returns Información de la bandera
 */
export function getCardBrandInfo(brand: CardBrand): CardBrandInfo {
  return CARD_PATTERNS[brand];
}

/**
 * Obtiene todas las banderas soportadas
 * @returns Array de todas las banderas
 */
export function getSupportedBrands(): CardBrandInfo[] {
  return Object.values(CARD_PATTERNS).filter(info => info.brand !== 'unknown');
}
